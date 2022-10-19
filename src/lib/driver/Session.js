import _ from 'lodash';
import * as StellarSdk from 'stellar-sdk';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import AppStellar from '@ledgerhq/hw-app-str';
import TrezorConnect from 'trezor-connect';
import { getPublicKey } from '@stellar/freighter-api';
import FastAverageColor from 'fast-average-color';
import isElectron from 'is-electron';
import directory from 'stellarterm-directory';
import MagicSpoon from '../MagicSpoon';
import Event from '../Event';
import * as request from '../api/request';
import { getEndpoint } from '../api/endpoints';
import * as EnvConsts from '../../env-consts';
import Stellarify from '../Stellarify';
import {
    buildOpBumpSequence,
    buildOpChangeTrust,
    buildOpClaimClaimableBalance,
    buildOpCreateAccount,
    buildOpCreateBuyOffer,
    buildOpCreateSellOffer, buildOpPathPaymentStrictReceive, buildOpPathPaymentStrictSend,
    buildOpRemoveOffer,
    buildOpSendPayment,
    buildOpSetOptions,
} from '../operationBuilders';
import { AUTH_TYPE, SESSION_EVENTS, SESSION_STATE, TX_STATUS } from '../constants';
import DelayedPromise from '../DelayedPromise';

const fee = '100000';
export const CACHED_ASSETS_ALIAS = 'cached_asset_data';
export const UPDATE_CACHED_ASSETS_TIMESTAMP = 'update_cached_asset_data_timestamp';
export const getAssetString = asset => `${asset.code}:${asset.issuer}`;

export default function Send(driver) {
    this.event = new Event();

    const init = () => {
        this.state = SESSION_STATE.OUT; // 'out', 'unfunded', 'loading', 'in' - SESSION_STATE
        this.setupError = false; // Unable to contact network

        this.setupLedgerError = null; // Could connect but couldn't reach address
        this.connectLedgerError = null;
        this.ledgerConnected = false;

        this.unfundedAccountId = '';
        this.account = null; // MagicSpoon.Account instance
        this.authType = ''; // '', 'secret', 'ledger', 'pubkey', 'trezor', 'freighter', 'wallet-connect' - AUTH_TYPE
        this.jwtToken = null;
        this.userFederation = '';

        this.hasPendingTransaction = false;
    };
    init();

    // TODO: This kludge was added a year ago. It might be fixed
    // Due to a bug in horizon where it doesn't update offers for accounts, we have to manually check
    // It shouldn't cause too much of an overhead
    this.forceUpdateAccountOffers = () => {
        const updateFn = _.get(this, 'account.updateOffers');
        if (updateFn) {
            updateFn();
        }
    };

    const getAssetDataRequestParams = new URLSearchParams();
    const timeoutDelay = 500;

    this.getAssetsData = assetStrings => {
        const cachedAssets = new Map(JSON.parse(localStorage.getItem(CACHED_ASSETS_ALIAS) || '[]'));

        const assetArray = Array.isArray(assetStrings) ? assetStrings : [assetStrings];

        const assetsToRequest = assetArray.filter(assetString => !cachedAssets.has(assetString));

        if (!assetsToRequest.length) {
            return Promise.resolve();
        }

        assetsToRequest.forEach(assetString => {
            if (!getAssetDataRequestParams.getAll('asset').includes(assetString)) {
                getAssetDataRequestParams.append('asset', assetString);
            }
        });

        if (this.delayedRequest) {
            this.delayedRequest.reset();
            return this.currentRequest;
        }

        this.delayedRequest = new DelayedPromise(timeoutDelay);

        this.currentRequest = this.delayedRequest.promise
            .then(() => {
                this.delayedRequest = null;
                const params = getAssetDataRequestParams.toString();
                getAssetDataRequestParams.delete('asset');
                return request.get(`${EnvConsts.ASSET_DATA_API}?${params}`);
            })
            .then(({ results }) => {
                if (!results.length) {
                    return Promise.reject();
                }
                const colorRequests = results.map(asset => this.handlers.loadAssetColor(asset));
                return Promise.all(colorRequests);
            })
            .then(assets => {
                const cached = new Map(JSON.parse(localStorage.getItem(CACHED_ASSETS_ALIAS) || '[]'));
                assets.forEach(asset => {
                    cached.set(getAssetString(asset), asset);
                });
                localStorage.setItem(CACHED_ASSETS_ALIAS, JSON.stringify(Array.from(cached.entries())));
            });

        return this.currentRequest;
    };

    this.cacheDirectoryAssetData = () => {
        const lastUpdateTimestamp = Number(localStorage.getItem(UPDATE_CACHED_ASSETS_TIMESTAMP) || 0);
        const periodUpdate = 24 * 60 * 60 * 1000;

        if (Date.now() - lastUpdateTimestamp > periodUpdate) {
            localStorage.removeItem(CACHED_ASSETS_ALIAS);
            localStorage.setItem(UPDATE_CACHED_ASSETS_TIMESTAMP, Date.now().toString());

            const { assets } = directory;

            this.getAssetsData(Object.keys(assets).map(item => item.split('-').join(':')));
        }
    };

    directory.initializeIssuerOrgs(EnvConsts.ANCHORS_URL)
        .then(() => {
            this.cacheDirectoryAssetData();
        });

    // Ping the Ledger device to see if it is connected
    this.tryConnectLedger = () =>
        TransportWebUSB.create()
            .then(transport => new AppStellar(transport))
            .then(app => app.getAppConfiguration())
            .then(() => {
                if (!this.ledgerConnected) {
                    this.ledgerConnected = true;
                    this.event.trigger(SESSION_EVENTS.LEDGER_EVENT, this);
                }
            })
            .catch(error => {
                this.ledgerConnected = false;
                this.connectLedgerError = error;
                this.event.trigger(SESSION_EVENTS.LEDGER_EVENT, this);
            });

    this.handlers = {
        logInWithSecret: async secretKey => {
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            return this.handlers.logIn(keypair, {
                authType: AUTH_TYPE.SECRET,
            });
        },
        logInWithPublicKey: async accountId => {
            const keypair = StellarSdk.Keypair.fromPublicKey(accountId);
            return this.handlers.logIn(keypair, {
                authType: AUTH_TYPE.PUBKEY,
            });
        },
        loginWithWalletConnect: async () => {
            await driver.walletConnectService.login();
        },
        logInWithFreighter: async () => {
            try {
                const publicKey = await getPublicKey();
                const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
                return this.handlers.logIn(keypair, {
                    authType: AUTH_TYPE.FREIGHTER,
                });
            } catch (e) {
                throw e;
            }
        },
        logInWithTrezor: async bip32Path =>
            TrezorConnect.stellarGetAddress({ path: bip32Path, showOnTrezor: false }).then(result => {
                if (result.success) {
                    const keypair = StellarSdk.Keypair.fromPublicKey(result.payload.address);
                    return this.handlers.logIn(keypair, {
                        authType: AUTH_TYPE.TREZOR,
                        bip32Path,
                    });
                }
                throw new Error(result.payload.error);
            }),
        logInWithLedger: async bip32Path => {
            try {
                const transport = await TransportWebUSB.create();
                const ledgerApp = new AppStellar(transport);
                const { publicKey } = await ledgerApp.getPublicKey(bip32Path);

                if (!publicKey || publicKey === 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF') {
                    throw new Error(
                        'Could not access your Ledger account. ' +
                            'Make sure your Ledger is not locked after idle timeout or update the firmware version. ' +
                            'Contact the support at support@stellarterm.com if the issue persists.',
                    );
                }

                this.setupLedgerError = null;

                const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
                return this.handlers.logIn(keypair, {
                    authType: AUTH_TYPE.LEDGER,
                    bip32Path,
                });
            } catch (error) {
                this.setupLedgerError = error.message;
                if (error && error.errorCode) {
                    const u2fErrorCodes = {
                        0: 'OK',
                        1: 'OTHER_ERROR',
                        2: 'BAD_REQUEST',
                        3: 'CONFIGURATION_UNSUPPORTED',
                        4: 'DEVICE_INELIGIBLE',
                        5: 'TIMEOUT (unable to communicate with device)',
                    };
                    this.setupLedgerError = u2fErrorCodes[error.errorCode];
                }
                this.event.trigger(SESSION_EVENTS.LEDGER_EVENT, this);
                return null;
            }
        },
        logIn: (keypair, opts) => {
            this.setupError = false;
            this.brakeUnfundedCheck = false;
            if (this.state !== SESSION_STATE.UNFUNDED) {
                this.state = SESSION_STATE.LOADING;
                this.event.trigger(SESSION_EVENTS.LOGIN_EVENT, this);
            }
            this.authType = opts.authType;
            const cachedAuthType = opts.authType;

            return MagicSpoon.Account(driver.Server, keypair, opts, () => {
                this.event.trigger(SESSION_EVENTS.ACCOUNT_EVENT, this);
            }).then(result => {
                // if there is no authType, it means that a logout was performed during loading (WalletConnect case)
                if (this.authType) {
                    this.account = result;
                    // Search for user federation
                    this.handlers.searchFederation(this.account.accountId())
                        .then(() => {
                            this.event.trigger(SESSION_EVENTS.FEDERATION_SEARCH_EVENT, this);
                        });

                    this.state = SESSION_STATE.IN;
                    this.bip32Path = opts.bip32Path;

                    // Functions of session after sign in
                    driver.accountEvents.listenAccountEvents(driver.Server, this.account.account_id);
                    this.event.trigger(SESSION_EVENTS.LOGIN_EVENT, this);

                    driver.claimableBalances.getClaimableBalances();
                    return;
                }
                if (cachedAuthType === AUTH_TYPE.WALLET_CONNECT) {
                    driver.walletConnectService.login();
                }
            }).catch(e => {
                if (this.brakeUnfundedCheck) {
                    this.state = SESSION_STATE.OUT;
                    this.event.trigger(SESSION_EVENTS.LOGIN_EVENT, this);
                    return;
                }
                if (e.message !== 'Network Error') {
                    this.state = SESSION_STATE.UNFUNDED;
                    this.unfundedAccountId = keypair.publicKey();
                    setTimeout(() => {
                        console.log('Checking to see if account has been created yet');
                        if (this.state === SESSION_STATE.UNFUNDED) {
                            // Avoid race conditions
                            this.handlers.logIn(keypair, opts);
                        }
                    }, 5000);
                    this.event.trigger(SESSION_EVENTS.LOGIN_EVENT, this);
                    return;
                }
                console.log(e);
                this.state = SESSION_STATE.OUT;
                this.setupError = true;
                this.event.trigger(SESSION_EVENTS.LOGIN_EVENT, this);
            });
        },
        sign: async tx => {
            if (this.authType === AUTH_TYPE.SECRET) {
                this.account.signWithSecret(tx);
                console.log('Signed tx\nhash:', tx.hash().toString('hex'), `\n\n${tx.toEnvelope().toXDR('base64')}`);
                return {
                    status: TX_STATUS.FINISH,
                    signedTx: tx,
                };
            } else if (this.authType === AUTH_TYPE.WALLET_CONNECT) {
                return driver.walletConnectService.signTx(tx);
            } else if (this.authType === AUTH_TYPE.LEDGER) {
                return driver.modal.handlers.activate('signWithLedger', tx).then(async modalResult => {
                    if (modalResult.status === 'finish') {
                        console.log(
                            'Signed tx with ledger\nhash:',
                            modalResult.output.hash().toString('hex'),
                            `\n\n${modalResult.output.toEnvelope().toXDR('base64')}`,
                        );
                        if (driver.session.account.signers.length > 1) {
                            driver.modal.handlers.cancel();
                        }
                        return {
                            status: TX_STATUS.FINISH,
                            signedTx: modalResult.output,
                        };
                    }
                    return modalResult;
                });
            } else if (this.authType === AUTH_TYPE.TREZOR) {
                const signedTx = await this.account.signWithTrezor(tx);
                return {
                    status: TX_STATUS.FINISH,
                    signedTx,
                };
            } else if (this.authType === AUTH_TYPE.FREIGHTER) {
                const signedTx = await this.account.signWithFreighter(tx);
                return {
                    status: TX_STATUS.FINISH,
                    signedTx,
                };
            }
            return driver.modal.handlers.activate('sign', tx).then(async modalResult => {
                if (modalResult.status === TX_STATUS.FINISH) {
                    await this.account.sign(tx);
                    console.log(
                        'Signed tx\nhash:',
                        tx.hash().toString('hex'),
                        `\n\n${tx.toEnvelope().toXDR('base64')}`,
                    );
                    return {
                        status: TX_STATUS.FINISH,
                        signedTx: tx,
                    };
                }
                return modalResult;
            });
        },
        buildSignSubmit: async (ops, memo, withMuxing) => {
            if (this.hasPendingTransaction) {
                driver.toastService.error(
                    'Transaction in progress',
                    'Another transaction is currently in progress',
                );
                return Promise.reject();
            }
            this.hasPendingTransaction = true;

            await this.account.updateSequence();

            const tx = new StellarSdk.TransactionBuilder(this.account, {
                fee,
                networkPassphrase: driver.Server.networkPassphrase,
                withMuxing: Boolean(withMuxing),
            }).setTimeout(driver.Server.transactionTimeout);

            if (Array.isArray(ops)) {
                ops.forEach(op => {
                    tx.addOperation(op);
                });
            } else {
                tx.addOperation(ops);
            }
            if (memo) {
                tx.addMemo(Stellarify.memo(memo.type, memo.content));
            }
            return this.handlers.signSubmit(tx.build());
        },
        signSubmit: async transaction => {
            // Returns: bssResult which contains status and (if finish) serverResult
            // Either returns a cancel or finish with the transaction-in-flight Promise
            // (finish only means modal finished; It does NOT mean the transaction succeeded)
            let result = {
                status: TX_STATUS.CANCEL,
            };
            try {
                const signResult = await this.handlers.sign(transaction);
                if (signResult.status === TX_STATUS.SENT_TO_WALLET_CONNECT) {
                    this.hasPendingTransaction = false;
                    return {
                        status: TX_STATUS.SENT_TO_WALLET_CONNECT,
                    };
                }
                if (signResult.status === TX_STATUS.FINISH) {
                    const tx = signResult.signedTx;
                    const threshold = this.handlers.getTransactionThreshold(tx);
                    const thresholdValue = this.account.thresholds[threshold];
                    const masterWeight = this.account.signers.find(signer => signer.key === this.account.account_id)
                        .weight;

                    if (driver.session.account.signers.length > 1 && masterWeight < thresholdValue) {
                        this.hasPendingTransaction = false;
                        return this.handlers.sendToSigner(signResult);
                    }
                    console.log('Submitting tx\nhash:', tx.hash().toString('hex'));
                    const serverResult = driver.Server.submitTransaction(tx, { skipMemoRequiredCheck: true })
                        .then(transactionResult => {
                            this.hasPendingTransaction = false;
                            console.log('Confirmed tx\nhash:', tx.hash().toString('hex'));
                            this.account.refresh();
                            if (this.authType === AUTH_TYPE.LEDGER) {
                                driver.modal.handlers.ledgerFinish('closeWithTimeout', 3000);
                            }
                            return transactionResult;
                        })
                        .catch(error => {
                            this.hasPendingTransaction = false;
                            if (this.authType === AUTH_TYPE.LEDGER) {
                                driver.modal.handlers.ledgerFinish('error');
                            }
                            console.log('Failed tx\nhash:', tx.hash().toString('hex'));
                            throw error;
                        });
                    result = {
                        status: TX_STATUS.FINISH,
                        serverResult,
                    };
                } else {
                    this.hasPendingTransaction = false;
                }
            } catch (e) {
                this.hasPendingTransaction = false;
                return {
                    status: TX_STATUS.FINISH,
                    serverResult: Promise.reject(e),
                };
            }
            return result; // bssResult
        },

        getSignerMarker: key => {
            const markers = {
                lobstrVault: 'GA2T6GR7VXXXBETTERSAFETHANSORRYXXXPROTECTEDBYLOBSTRVAULT',
                stellarGuard: 'GCVHEKSRASJBD6O2Z532LWH4N2ZLCBVDLLTLKSYCSMBLOYTNMEEGUARD',
            };

            return markers[key];
        },

        getTransactionThreshold: tx => {
            const { operations } = tx;

            const THRESHOLDS = {
                low_threshold: ['allowTrust', 'inflation', 'bumpSequence'],
                med_threshold: [
                    'createAccount',
                    'payment',
                    'pathPayment',
                    'createPassiveSellOffer',
                    'changeTrust',
                    'manageData',
                    'manageBuyOffer',
                    'manageSellOffer',
                    'claimClaimableBalance',
                    'pathPaymentStrictSend',
                    'pathPaymentStrictReceive',
                ],
                high_threshold: ['accountMerge'],
                setOptions: ['setOptions'], // med or high
            };

            return operations.reduce((acc, operation) => {
                const { type } = operation;

                let usedThreshold = Object.keys(THRESHOLDS).reduce((used, key) => {
                    if (THRESHOLDS[key].includes(type)) {
                        return key;
                    }
                    return used;
                }, 'unknown');

                if (usedThreshold === 'unknown') {
                    throw new Error('unknown operation');
                }

                if (usedThreshold === 'setOptions') {
                    const { masterWeight, lowThreshold, medThreshold, highThreshold, signer } = operation;
                    usedThreshold =
                        masterWeight || lowThreshold || medThreshold || highThreshold || signer
                            ? 'high_threshold'
                            : 'med_threshold';
                }

                if (usedThreshold === 'low_threshold') {
                    return acc;
                }
                if (usedThreshold === 'med_threshold') {
                    return acc === 'high_threshold' ? acc : usedThreshold;
                }

                return usedThreshold;
            }, 'low_threshold');
        },

        sendToSigner: signResult => {
            const signedTx = signResult.signedTx.toEnvelope().toXDR('base64');

            const knownSigners = {
                [this.handlers.getSignerMarker('lobstrVault')]: {
                    apiUrl: getEndpoint('sendTransactionToVault'),
                    title: 'LOBSTR Vault',
                    logo: 'sign-vault',
                },
                [this.handlers.getSignerMarker('stellarGuard')]: {
                    apiUrl: getEndpoint('sendTransactionToGuard'),
                    title: 'StellarGuard',
                    logo: 'sign-stellarguard',
                },
            };

            const usedKnownSigner = driver.session.account.signers.find(sign => knownSigners[sign.key]);

            if (!usedKnownSigner) {
                setTimeout(() => driver.modal.handlers.activate('multisigUnknown', {
                    tx: signedTx,
                    isTestnet: driver.Server.isTestnet,
                }), 1000);
            } else {
                const signer = knownSigners[usedKnownSigner.key];
                const body = JSON.stringify({ xdr: signedTx });
                const headers = { 'Content-Type': 'application/json' };
                request
                    .post(signer.apiUrl, { headers, body })
                    .then(() => driver.modal.handlers.activate('multisig', signer))
                    .catch(e => console.error(e));
            }
            return {
                status: TX_STATUS.AWAIT_SIGNERS,
            };
        },

        isLobstrVaultKey: key => {
            const headers = { 'Content-Type': 'application/json' };
            const body = JSON.stringify({ address: key });
            return request
                .post(getEndpoint('isVaultSigner'), { headers, body })
                .then(res => res)
                .catch(e => console.error(e));
        },

        isInvalidWeigth: () => {
            const vaultMarker = this.handlers.getSignerMarker('lobstrVault');
            const guardMarker = this.handlers.getSignerMarker('stellarGuard');
            let hasCustomWeigth = false;
            let markerMiss = true;
            this.account.signers.forEach(signer => {
                if (signer.key === vaultMarker || signer.key === guardMarker) {
                    markerMiss = false;
                }
                if (signer.key === vaultMarker && signer.weight !== 1) {
                    hasCustomWeigth = true;
                }
                if (signer.key === guardMarker && signer.weight !== 1) {
                    hasCustomWeigth = true;
                }
                if (signer.key !== vaultMarker && signer.key !== guardMarker && signer.weight !== 10) {
                    hasCustomWeigth = true;
                }
            });

            return hasCustomWeigth || markerMiss;
        },

        // provider is 'lobstrVault' or 'stellarGuard'
        addSigner: (key, provider) => {
            const { signers } = this.account;
            if (signers.find(signer => signer.key === key)) {
                return Promise.reject('This key is already used');
            }
            if (signers.length > 1) {
                if (this.handlers.isInvalidWeigth()) {
                    return Promise.reject('Custom signers weigth');
                }
                const currentThreshold = this.account.thresholds.high_threshold;
                const newThreshold = currentThreshold + 10;
                const signerData = {
                    signer: {
                        ed25519PublicKey: key,
                        weight: 10,
                    },
                    lowThreshold: newThreshold,
                    medThreshold: newThreshold,
                    highThreshold: newThreshold,
                };
                const op = buildOpSetOptions(signerData);
                return this.handlers.buildSignSubmit(op);
            }
            const signerData = {
                signer: {
                    ed25519PublicKey: key,
                    weight: 10,
                },
                masterWeight: 10,
                lowThreshold: 20,
                medThreshold: 20,
                highThreshold: 20,
            };

            if (provider) {
                const markerData = {
                    signer: {
                        ed25519PublicKey: this.handlers.getSignerMarker(provider),
                        weight: 1,
                    },
                };
                const op = buildOpSetOptions([signerData, markerData]);
                return this.handlers.buildSignSubmit(op);
            }

            const op = buildOpSetOptions(signerData);
            return this.handlers.buildSignSubmit(op);
        },

        activateGuardSigner: () => {
            const guardUrl = getEndpoint('activateGuardSigner') + this.account.account_id.toString();
            request
                .post(guardUrl)
                .then(() => {})
                .catch(e => console.error(e));
        },

        removeSigner: key => {
            const { signers } = this.account;

            const signerData = {
                signer: {
                    ed25519PublicKey: key,
                    weight: 0,
                },
                masterWeight: 1,
                lowThreshold: 0,
                medThreshold: 0,
                highThreshold: 0,
            };
            if (signers.length === 2) {
                const op = buildOpSetOptions(signerData);
                return this.handlers.buildSignSubmit(op);
            }
            if (signers.length === 3) {
                const hasVaultMarker = signers.find(
                    signer => signer.key === this.handlers.getSignerMarker('lobstrVault'),
                );
                const hasGuardMarker = signers.find(
                    signer => signer.key === this.handlers.getSignerMarker('stellarGuard'),
                );

                if (!hasVaultMarker && !hasGuardMarker) {
                    const op = buildOpSetOptions(signerData);
                    return this.handlers.buildSignSubmit(op);
                }

                if (this.handlers.isInvalidWeigth()) {
                    return Promise.reject('Custom signers weigth');
                }

                const markerKey = (hasVaultMarker && hasVaultMarker.key) || (hasGuardMarker && hasGuardMarker.key);
                const markerData = {
                    signer: {
                        ed25519PublicKey: markerKey,
                        weight: 0,
                    },
                };

                const op = buildOpSetOptions([signerData, markerData]);
                return this.handlers.buildSignSubmit(op);
            }
            if (signers.length >= 4) {
                if (this.handlers.isInvalidWeigth()) {
                    return Promise.reject('Custom signers weigth');
                }
                const currentThreshold = this.account.thresholds.high_threshold;

                const newThreshold =
                    (signers.length - 2) * 10 > currentThreshold ? currentThreshold : (signers.length - 2) * 10;

                const newSignerData = {
                    signer: {
                        ed25519PublicKey: key,
                        weight: 0,
                    },
                    lowThreshold: newThreshold,
                    medThreshold: newThreshold,
                    highThreshold: newThreshold,
                };

                const op = buildOpSetOptions(newSignerData);
                return this.handlers.buildSignSubmit(op);
            }

            return Promise.reject();
        },

        setRequiredSigners: qty => {
            const newThreshold = qty * 10;
            const options = {
                lowThreshold: newThreshold,
                medThreshold: newThreshold,
                highThreshold: newThreshold,
            };

            const op = buildOpSetOptions(options);
            return this.handlers.buildSignSubmit(op);
        },

        getJwtToken: (endpointUrl, networkPassphrase) => {
            const headers = { 'Content-Type': 'application/json' };

            // Gets current network if network param is not provided
            const selectedNetwork = networkPassphrase || driver.Server.networkPassphrase;
            return request
                .get(endpointUrl, { headers })
                .then(resChallenge => {
                    const tx = new StellarSdk.Transaction(resChallenge.transaction, selectedNetwork);
                    return this.handlers.sign(tx);
                })
                .then(tx => {
                    const body = JSON.stringify({ transaction: tx.signedTx.toEnvelope().toXDR('base64') });
                    return request.post(endpointUrl, { headers, body });
                })
                .then(({ token }) => {
                    if (this.authType === AUTH_TYPE.LEDGER) {
                        driver.modal.handlers.ledgerFinish('closeWithTimeout', 1000);
                    }
                    return token;
                });
        },

        setFederation: async fedName => {
            if (this.jwtToken === null) {
                const userPublicKey = this.account.accountId();
                const params = { account: userPublicKey };
                this.jwtToken = await this.handlers.getJwtToken(getEndpoint('getJwtToken', params));
            }

            const headers = { 'Content-Type': 'application/json', Authorization: `JWT ${this.jwtToken}` };
            const body = JSON.stringify({ name: fedName });
            const reqType = this.userFederation === '' ? request.post : request.patch;

            const response = await reqType(getEndpoint('setFederation'), { headers, body });
            this.userFederation = response.name.split('*')[0];
            this.event.trigger(SESSION_EVENTS.FEDERATION_UPDATE_EVENT, this);
            await this.handlers.setHomeDomain();
            return response;
        },

        setHomeDomain: async () => {
            if (this.account.signers.length > 1) {
                await this.account.refresh();
            }
            const homeDomainExists = this.account.home_domain === 'stellarterm.com';
            if (homeDomainExists) {
                return;
            }

            const homeDomain = {
                homeDomain: 'stellarterm.com',
            };

            try {
                // Setting homeDomain for user
                const op = buildOpSetOptions(homeDomain);
                await this.handlers.buildSignSubmit(op);
            } catch (error) {
                console.log(error);
            }
        },

        searchFederation: userPublicKey => {
            const headers = { 'Content-Type': 'application/json' };
            const params = { q: userPublicKey, type: 'id' };
            return request
                .get(`${getEndpoint('getFederation', params)}`, { headers })
                .then(res => {
                    this.userFederation = res.stellar_address.split('*')[0];
                })
                .catch(e => e.data);
        },
        addTrust: async (code, issuer, memo) => {
            // We only add max trust line
            // Having a "limit" is a design mistake in Stellar that was carried over from the Ripple codebase
            const op = buildOpChangeTrust({ asset: new StellarSdk.Asset(code, issuer) });
            return this.handlers.buildSignSubmit(op, memo);
        },
        removeTrust: async (code, issuer, memo) => {
            // Trust lines are removed by setting limit to 0
            const op = buildOpChangeTrust({
                asset: new StellarSdk.Asset(code, issuer),
                limit: '0',
            });
            return this.handlers.buildSignSubmit(op, memo);
        },
        claimClaimableBalance: (id, asset, withAddTrust, withBumpSequence) => {
            const ops = [];

            if (withAddTrust) {
                ops.push(buildOpChangeTrust({ asset }));
            }

            // fix for ledger
            if (!withAddTrust && withBumpSequence) {
                ops.push(buildOpBumpSequence(this.account.sequence, this.account.id));
            }

            ops.push(buildOpClaimClaimableBalance(id));

            return this.handlers.buildSignSubmit(ops);
        },
        createOffer: async (side, opts) => {
            const options = _.assign(opts, {
                baseBuying: driver.orderbook.data.baseBuying,
                counterSelling: driver.orderbook.data.counterSelling,
            });
            let op;
            if (side === 'buy') {
                op = await buildOpCreateBuyOffer(options, this.authType);
            } else if (side === 'sell') {
                op = buildOpCreateSellOffer(options);
            } else {
                throw new Error(`Invalid side ${side}`);
            }

            const bssResult = await this.handlers.buildSignSubmit(op);
            if (bssResult.status === TX_STATUS.FINISH) {
                bssResult.serverResult.then(res => {
                    this.account.updateOffers();
                    return res;
                });
            }
            return bssResult;
        },
        // offers can be single or array of offers
        removeOffer: async offers => {
            const ops = buildOpRemoveOffer(offers);

            const bssResult = await this.handlers.buildSignSubmit(ops);
            if (bssResult.status === TX_STATUS.FINISH) {
                bssResult.serverResult.then(res => {
                    this.account.updateOffers();
                    return res;
                });
            }
            return bssResult;
        },
        // sendPayment will detect if the account is a new account. If so, then it will
        // be a createAccount operation
        send: async (opts, memo) => {
            let op;
            const baseAccount = opts.withMuxing ?
                StellarSdk.MuxedAccount.fromAddress(opts.destination, '0').baseAccount().accountId()
                : null;
            try {
                // We need to check the activation of the destination,
                // if the account is not activated, it will be created in catch with createAccount
                await driver.Server.loadAccount(opts.withMuxing ? baseAccount : opts.destination);
                op = buildOpSendPayment(opts);
            } catch (e) {
                if (!opts.asset.isNative()) {
                    throw new Error('Destination account does not exist. To create it, you must send at least 1 XLM.');
                }
                if (opts.withMuxing) {
                    // eslint-disable-next-line no-param-reassign
                    opts.destination = baseAccount;
                }
                op = buildOpCreateAccount(opts);
            }

            return this.handlers.buildSignSubmit(op, memo, opts.withMuxing);
        },
        swap: opts => {
            const ops = [];

            if (opts.withTrust) {
                ops.push(buildOpChangeTrust({ asset: opts.destination }));
            }
            // eslint-disable-next-line no-param-reassign
            opts.address = this.account.accountId();
            const op = opts.isSend ? buildOpPathPaymentStrictSend(opts) : buildOpPathPaymentStrictReceive(opts);
            ops.push(op);

            return this.handlers.buildSignSubmit(ops);
        },
        logout: () => {
            try {
                if (!isElectron() && this.authType !== AUTH_TYPE.WALLET_CONNECT) {
                    window.location.reload();
                    return;
                }

                if (!driver.isOnline) {
                    driver.toastService.error('No connection', 'Internet connection appears to be offline');
                    return;
                }

                if (this.authType === AUTH_TYPE.WALLET_CONNECT) {
                    driver.walletConnectService.logout();
                }
                this.handlers.handleLogout();
            } catch (e) {
                console.log(e);
                window.location.reload();
            }
        },
        handleLogout: () => {
            if (this.account) {
                driver.accountEvents.stopListenAccountEvents();
                this.account.clearKeypair();
                delete this.account;
                driver.claimableBalances.resetClaimableBalances();
                driver.payments.resetPayments();
                driver.effects.resetEffects();
                init();
                this.event.trigger(SESSION_EVENTS.LOGOUT_EVENT, this);
            }
            this.brakeUnfundedCheck = true;
            init();
            this.event.trigger(SESSION_EVENTS.LOGOUT_EVENT, this);
        },

        getDomainByIssuer: async issuer => {
            const account = await driver.Server.loadAccount(issuer);
            if (!account.home_domain) {
                return null;
            }
            return account.home_domain;
        },

        getAverageColor: (imageUrl, code, domain) => {
            const fac = new FastAverageColor();
            const img = document.createElement('img');
            img.src = imageUrl;
            img.crossOrigin = 'Anonymous';

            return fac
                .getColorAsync(img)
                .then(col => col.hex)
                .catch(() => {
                    console.warn(`Can not calculate background color for ${code} (${domain}). Reason: CORS Policy`);
                    return '';
                });
        },

        loadAssetColor: asset => {
            if (asset.image) {
                return this.handlers
                    .getAverageColor(asset.image, asset.code, asset.issuer)
                    .then(result => Object.assign(asset, { color: result }));
            }
            return Promise.resolve(asset);
        },
    };
}
