import _ from 'lodash';
import * as StellarSdk from 'stellar-sdk';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import AppStellar from '@ledgerhq/hw-app-str';
import TrezorConnect from 'trezor-connect';
import { getPublicKey } from '@stellar/freighter-api';
import FastAverageColor from 'fast-average-color';
import isElectron from 'is-electron';
import directory from 'stellarterm-directory';
import MagicSpoon from '../../helpers/MagicSpoon';
import Event from '../../helpers/Event';
import * as request from '../../api/request';
import { getEndpoint } from '../../api/endpoints';
import * as EnvConsts from '../../../env-consts';
import Stellarify from '../../helpers/Stellarify';
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
} from '../../helpers/operationBuilders';
import {
    AUTH_TYPE,
    JWT_TOKEN_MINIMUM_REMAINING_LIFETIME,
    SESSION_EVENTS,
    SESSION_STATE,
    TX_STATUS,
} from '../../constants/sessionConstants';
import { CONTENT_TYPE_HEADER } from '../../constants/commonConstants';
import DelayedPromise from '../../helpers/DelayedPromise';
import { MULTISIG_PROVIDERS } from '../../constants/multisigConstants';

const fee = '100000';
export const CACHED_ASSETS_ALIAS = 'cached_asset_data';
export const UPDATE_CACHED_ASSETS_TIMESTAMP = 'update_cached_asset_data_timestamp';
export const getAssetString = asset => `${asset.code}:${asset.issuer}`;

const JWT_TOKENS_CACHE = new Map();

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

                    if (driver.multisig.multisigProvider === MULTISIG_PROVIDERS.STELLAR_GUARD) {
                        driver.multisig.checkGuardSignerActivation();
                    }

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

                    if (driver.multisig.isMultisigEnabled && driver.multisig.moreSignaturesNeeded(tx)) {
                        this.hasPendingTransaction = false;

                        return driver.multisig.sendToSigner(tx);
                    }

                    console.log('Submitting tx\nhash:', tx.hash().toString('hex'));
                    const serverResult = driver.Server.submitTransaction(tx)
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
        getAuthChallengeTx: (endpointUrl, networkPassphrase) => {
            // Gets current network if network param is not provided
            const selectedNetwork = networkPassphrase || driver.Server.networkPassphrase;
            return request
                .get(endpointUrl, { headers: CONTENT_TYPE_HEADER })
                .then(resChallenge => new StellarSdk.Transaction(resChallenge.transaction, selectedNetwork));
        },
        getToken: (endpointUrl, signedTx) => {
            const body = JSON.stringify({ transaction: signedTx.toEnvelope().toXDR('base64') });

            return request.post(endpointUrl, { headers: CONTENT_TYPE_HEADER, body })
                .then(({ token }) => {
                    if (this.authType === AUTH_TYPE.LEDGER) {
                        driver.modal.handlers.ledgerFinish('closeWithTimeout', 1000);
                    }
                    JWT_TOKENS_CACHE.set(endpointUrl, token);
                    return token;
                });
        },
        isJwtTokenExpired: token => {
            const expiry = (JSON.parse(window.atob(token.split('.')[1]))).exp * 1000;
            return expiry - Date.now() < JWT_TOKEN_MINIMUM_REMAINING_LIFETIME;
        },
        getTokenFromCache: endpoint => {
            const tokenFromCache = JWT_TOKENS_CACHE.get(endpoint);
            if (!tokenFromCache || this.handlers.isJwtTokenExpired(tokenFromCache)) {
                return null;
            }
            return tokenFromCache;
        },
        setFederation: async fedName => {
            if (this.jwtToken === null) {
                const userPublicKey = this.account.accountId();
                const params = { account: userPublicKey };
                const endpoint = getEndpoint('stellartermFederationAuth', params);

                const challengeTx = await this.handlers.getAuthChallengeTx(endpoint);
                const { signedTx } = await this.handlers.sign(challengeTx);
                this.jwtToken = await this.handlers.getToken(endpoint, signedTx);
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
