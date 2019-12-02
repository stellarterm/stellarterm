import _ from 'lodash';
import Transport from '@ledgerhq/hw-transport-u2f';
import AppStellar from '@ledgerhq/hw-app-str';
import FastAverageColor from 'fast-average-color';
import directory from 'stellarterm-directory';
import MagicSpoon from '../MagicSpoon';
import Event from '../Event';
import * as request from '../api/request';
import { getEndpoint } from '../api/endpoints';


export default function Send(driver) {
    this.event = new Event();

    const init = () => {
        this.state = 'out'; // 'out', 'unfunded', 'loading', 'in'
        this.setupError = false; // Unable to contact network

        this.setupLedgerError = null; // Could connect but couldn't reach address
        this.ledgerConnected = false;

        this.unfundedAccountId = '';
        this.inflationDone = false;
        this.account = null; // MagicSpoon.Account instance
        this.authType = ''; // '', 'secret', 'ledger', 'pubkey'
        this.jwtToken = null;
        this.userFederation = '';
        this.promisesForMyltipleLoading = {};
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

    this.addKnownAssetData = () => {
        const knownAssetsData = JSON.parse(localStorage.getItem('knownAssetsData')) || [];
        const { time } = knownAssetsData.find(item => Object.prototype.hasOwnProperty.call(item, 'time')) || '';
        const periodUpdate = 14 * 24 * 60 * 60 * 1000;

        if (knownAssetsData.length && ((new Date() - new Date(time)) < periodUpdate)) {
            this.addKnownAssetDataCalled = true;
            return Promise.resolve();
        }

        const { anchors } = directory;
        const chainPromise = Object.keys(anchors).reduce((chain, anchorDomain) => {
            const { assets } = anchors[anchorDomain];

            return chain.then(newArray => StellarSdk.StellarTomlResolver.resolve(anchorDomain)
                    .then((toml) => {
                        const currencies = toml.CURRENCIES;
                        const arrayAssets = Object.keys(assets).reduce((acc, assetCode) => {
                            const assetIssuer = assets[assetCode].split('-')[1];
                            const currency = currencies.find(cur => (
                                cur.code === assetCode && cur.issuer === assetIssuer
                            ));
                            if (!currency || !currency.image) {
                                return acc;
                            }
                            acc.push({
                                code: assetCode,
                                issuer: assetIssuer,
                                logo: currency.image,
                            });
                            return acc;
                        }, []);

                        if (arrayAssets.length === 0) {
                            return newArray;
                        }
                        return [...newArray, ...arrayAssets];
                    })
                    .catch(() => newArray));
        }, Promise.resolve([]));

        return chainPromise.then((res) => {
            localStorage.setItem('knownAssetsData', JSON.stringify([...res, { time: new Date() }]));
            this.addKnownAssetDataCalled = true;
        });
    };
    this.addKnownAssetDataPromise = this.addKnownAssetData();

    // Ping the Ledger device to see if it is connected
    this.pingLedger = (singlePing) => {
        let brakePing = singlePing || false;
        Transport.create()
            .then(transport => new AppStellar(transport))
            .then(app => app.getAppConfiguration())
            .then(() => {
                if (!this.ledgerConnected) {
                    this.ledgerConnected = true;
                    this.event.trigger();
                }
            })
            .catch((error) => {
                if (this.ledgerConnected) {
                    this.ledgerConnected = false;
                    this.event.trigger();
                }

                const notSupported = error && error.id === 'U2FNotSupported';
                if (notSupported || brakePing) {
                    return;
                }
                // Could not connect to ledger, retry...
                this.pingLedger();
            });
        return (() => { brakePing = true; });
    };

    this.handlers = {
        logInWithSecret: async (secretKey) => {
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            return this.handlers.logIn(keypair, {
                authType: 'secret',
            });
        },
        logInWithPublicKey: async (accountId) => {
            const keypair = StellarSdk.Keypair.fromPublicKey(accountId);
            return this.handlers.logIn(keypair, {
                authType: 'pubkey',
            });
        },
        logInWithLedger: async (bip32Path) => {
            try {
                const transport = await Transport.create();
                const ledgerApp = new AppStellar(transport);
                const connectionResult = await ledgerApp.getPublicKey(bip32Path);
                this.setupLedgerError = null;
                const keypair = StellarSdk.Keypair.fromPublicKey(connectionResult.publicKey);
                return this.handlers.logIn(keypair, {
                    authType: 'ledger',
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
                this.event.trigger();
            }
        },
        logIn: async (keypair, opts) => {
            this.setupError = false;
            if (this.state !== 'unfunded') {
                this.state = 'loading';
                this.event.trigger();
            }

            try {
                this.account = await MagicSpoon.Account(driver.Server, keypair, opts, () => {
                    this.event.trigger();
                });
                // Search for user federation
                await this.handlers.searchFederation(this.account.accountId());

                this.state = 'in';
                this.authType = opts.authType;

                const inflationDoneDestinations = {
                    GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW: true,
                };

                if (inflationDoneDestinations[this.account.inflation_destination]) {
                    this.inflationDone = true;
                }

                // Functions of session after sign in
                this.handlers.addUnknownAssetData();
                driver.history.handlers.loadHistory(true);
                driver.history.handlers.listenNewTransactions(driver.Server, this.account.account_id);
                this.event.trigger();
            } catch (e) {
                if (e.response) {
                    this.state = 'unfunded';
                    this.unfundedAccountId = keypair.publicKey();
                    setTimeout(() => {
                        console.log('Checking to see if account has been created yet');
                        if (this.state === 'unfunded') {
                            // Avoid race conditions
                            this.handlers.logIn(keypair, opts);
                        }
                    }, 5000);
                    this.event.trigger();
                    return;
                }
                console.log(e);
                this.state = 'out';
                this.setupError = true;
                this.event.trigger();
            }
        },

        // Using buildSignSubmit is the preferred way to go. It handles sequence numbers correctly.
        // If you use sign, you have to pay attention to sequence numbers because js-stellar-sdk's .build() updates it magically
        // The reason this doesn't take in a TransactionBuilder so we can call build() here is that there
        // are cases when we want to paste in a raw transaction and sign that
        sign: async (tx) => {
            if (this.account.inflation_destination === 'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW') {
                console.log(
                    'Signing tx\nhash:',
                    tx.hash().toString('hex'),
                    `\nsequence: ${tx.sequence}`,
                    `\n\n${tx.toEnvelope().toXDR('base64')}`,
                );
                console.log(
                    `https://www.stellar.org/laboratory/#txsigner?xdr=${encodeURIComponent(
                        tx.toEnvelope().toXDR('base64'),
                    )}&network=public`,
                );
            }
            if (this.authType === 'secret') {
                this.account.signWithSecret(tx);
                console.log('Signed tx\nhash:', tx.hash().toString('hex'), `\n\n${tx.toEnvelope().toXDR('base64')}`);
                return {
                    status: 'finish',
                    signedTx: tx,
                };
            } else if (this.authType === 'ledger') {
                console.log(tx);
                return driver.modal.handlers.activate('signWithLedger', tx).then(async (modalResult) => {
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
                            status: 'finish',
                            signedTx: modalResult.output,
                        };
                    }
                    return modalResult;
                });
            }
            return driver.modal.handlers.activate('sign', tx).then(async (modalResult) => {
                if (modalResult.status === 'finish') {
                    await this.account.sign(tx);
                    console.log(
                        'Signed tx\nhash:',
                        tx.hash().toString('hex'),
                        `\n\n${tx.toEnvelope().toXDR('base64')}`,
                    );
                    return {
                        status: 'finish',
                        signedTx: tx,
                    };
                }
                return modalResult;
            });
        },
        buildSignSubmit: async (txBuilder) => {
            // Returns: bssResult which contains status and (if finish) serverResult
            // Either returns a cancel or finish with the transaction-in-flight Promise
            // (finish only means modal finished; It does NOT mean the transaction succeeded)

            // This will also undo the sequence number that stellar-sdk magically adds
            let result = {
                status: 'cancel',
            };

            const tx = txBuilder.build();
            try {
                const signResult = await this.handlers.sign(tx);
                if (signResult.status === 'finish') {
                    const threshold = this.handlers.getTransactionThreshold(tx);
                    const thresholdValue = this.account.thresholds[threshold];
                    const masterWeight = this.account.signers
                        .find(signer => signer.key === this.account.account_id).weight;

                    if ((driver.session.account.signers.length > 1) && (masterWeight < thresholdValue)) {
                        return this.handlers.sendToSigner(signResult);
                    }
                    console.log('Submitting tx\nhash:', tx.hash().toString('hex'));
                    const serverResult = driver.Server.submitTransaction(tx)
                        .then((transactionResult) => {
                            console.log('Confirmed tx\nhash:', tx.hash().toString('hex'));
                            this.account.refresh();
                            if (this.authType === 'ledger') {
                                driver.modal.handlers.ledgerFinish('closeWithTimeout');
                            }
                            return transactionResult;
                        })
                        .catch((error) => {
                            if (this.authType === 'ledger') {
                                driver.modal.handlers.ledgerFinish('error');
                            }
                            console.log('Failed tx\nhash:', tx.hash().toString('hex'));
                            throw error;
                        });
                    result = {
                        status: 'finish',
                        serverResult,
                    };
                }
            } catch (e) {
                console.log(e);
            }

            if (result.status !== 'finish') {
                this.account.decrementSequence();
            }

            return result; // bssResult
        },

        getSignerMarker: (key) => {
            const markers = {
                lobstrVault: 'GA2T6GR7VXXXBETTERSAFETHANSORRYXXXPROTECTEDBYLOBSTRVAULT',
                stellarGuard: 'GCVHEKSRASJBD6O2Z532LWH4N2ZLCBVDLLTLKSYCSMBLOYTNMEEGUARD',
            };

            return markers[key];
        },

        getTransactionThreshold: (tx) => {
            const { operations } = tx;

            const THRESHOLDS = {
                low_threshold: ['allowTrust', 'inflation', 'bumpSequence'],
                med_threshold: ['createAccount', 'payment', 'pathPayment', 'createPassiveSellOffer',
                    'changeTrust', 'manageData', 'manageBuyOffer', 'manageSellOffer'],
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
                    usedThreshold = (masterWeight || lowThreshold || medThreshold || highThreshold || signer) ?
                        'high_threshold' : 'med_threshold';
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

        sendToSigner: (signResult) => {
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
                setTimeout(() =>
                    driver.modal.handlers.activate('multisigUnknown', signedTx), 1000);
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
                status: 'await_signers',
            };
        },

        isLobstrVaultKey: (key) => {
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
            this.account.signers.forEach((signer) => {
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
                const newThreshold = (currentThreshold + 10);
                const signerData = {
                    signer: {
                        ed25519PublicKey: key,
                        weight: 10,
                    },
                    lowThreshold: newThreshold,
                    medThreshold: newThreshold,
                    highThreshold: newThreshold,
                };
                const tx = MagicSpoon.buildTxSetOptions(this.account, signerData);
                return this.handlers.buildSignSubmit(tx);
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

                const txMarker = MagicSpoon.buildTxSetOptions(this.account, [signerData, markerData]);
                return this.handlers.buildSignSubmit(txMarker);
            }

            const tx = MagicSpoon.buildTxSetOptions(this.account, signerData);
            return this.handlers.buildSignSubmit(tx);
        },

        activateGuardSigner: () => {
            const guardUrl = getEndpoint('activateGuardSigner') + this.account.account_id.toString();
            request
                .post(guardUrl)
                .then(() => {})
                .catch(e => console.error(e));
        },

        removeSigner: (key) => {
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
                const tx = MagicSpoon.buildTxSetOptions(this.account, signerData);
                return this.handlers.buildSignSubmit(tx);
            }
            if (signers.length === 3) {
                const hasVaultMarker = signers.find(
                    signer => signer.key === this.handlers.getSignerMarker('lobstrVault'),
                );
                const hasGuardMarker = signers.find(
                    signer => signer.key === this.handlers.getSignerMarker('stellarGuard'),
                );

                if (!hasVaultMarker && !hasGuardMarker) {
                    const tx = MagicSpoon.buildTxSetOptions(this.account, signerData);
                    return this.handlers.buildSignSubmit(tx);
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
                const txMarker = MagicSpoon.buildTxSetOptions(this.account, [signerData, markerData]);
                return this.handlers.buildSignSubmit(txMarker);
            }
            if (signers.length >= 4) {
                if (this.handlers.isInvalidWeigth()) {
                    return Promise.reject('Custom signers weigth');
                }
                const currentThreshold = this.account.thresholds.high_threshold;

                const newThreshold = ((signers.length - 2) * 10) > currentThreshold ?
                    currentThreshold :
                    ((signers.length - 2) * 10);

                const newSignerData = {
                    signer: {
                        ed25519PublicKey: key,
                        weight: 0,
                    },
                    lowThreshold: newThreshold,
                    medThreshold: newThreshold,
                    highThreshold: newThreshold,
                };
                const txMarker = MagicSpoon.buildTxSetOptions(this.account, [newSignerData]);
                return this.handlers.buildSignSubmit(txMarker);
            }

            return Promise.reject();
        },

        setRequiredSigners: (qty) => {
            const newThreshold = qty * 10;
            const options = {
                lowThreshold: newThreshold,
                medThreshold: newThreshold,
                highThreshold: newThreshold,
            };
            const txMarker = MagicSpoon.buildTxSetOptions(this.account, [options]);
            return this.handlers.buildSignSubmit(txMarker);
        },

        getJwtToken: () => {
            const userPublicKey = this.account.accountId();
            const headers = { 'Content-Type': 'application/json' };
            const params = { account: userPublicKey };

            return request
                .get(getEndpoint('getJwtToken', params), { headers })
                .then((resChallenge) => {
                    const tx = new StellarSdk.Transaction(resChallenge.transaction);
                    return this.handlers.sign(tx);
                })
                .then((tx) => {
                    const body = JSON.stringify({ transaction: tx.signedTx.toEnvelope().toXDR('base64') });
                    return request.post(getEndpoint('getJwtToken'), { headers, body });
                })
                .then((res) => {
                    this.jwtToken = res.token;
                    if (this.authType === 'ledger') {
                        driver.modal.handlers.ledgerFinish('close');
                    }
                });
        },

        setFederation: async (fedName) => {
            if (this.jwtToken === null) {
                await this.handlers.getJwtToken();
            }

            const headers = { 'Content-Type': 'application/json', Authorization: `JWT ${this.jwtToken}` };
            const body = JSON.stringify({ name: fedName });
            const reqType = this.userFederation === '' ? request.post : request.patch;

            const response = await reqType(getEndpoint('setFederation'), { headers, body });
            this.userFederation = response.name.split('*')[0];
            this.event.trigger();
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
                const tx = MagicSpoon.buildTxSetOptions(this.account, homeDomain);
                await this.handlers.buildSignSubmit(tx);
            } catch (error) {
                console.log(error);
            }
        },

        searchFederation: (userPublicKey) => {
            const headers = { 'Content-Type': 'application/json' };
            const params = { q: userPublicKey, type: 'id' };
            return request
                .get(`${getEndpoint('getFederation', params)}`, { headers })
                .then((res) => {
                    this.userFederation = res.stellar_address.split('*')[0];
                })
                .catch(e => e.data);
        },

        setInflation: async (destination) => {
            const inflationDestination = {
                inflationDest: destination,
            };
            const txBuilder = MagicSpoon.buildTxSetOptions(this.account, inflationDestination);
            return await this.handlers.buildSignSubmit(txBuilder);
        },
        voteContinue: async () => {
            const bssResult = await this.handlers.setInflation(
                'GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW',
            );
            if (bssResult.status === 'finish' || bssResult.status === 'await_signers') {
                this.inflationDone = true;
                this.event.trigger();
            }
        },
        noThanks: () => {
            this.inflationDone = true;
            this.event.trigger();
        },
        addTrust: async (code, issuer,  memo) => {
            // We only add max trust line
            // Having a "limit" is a design mistake in Stellar that was carried over from the Ripple codebase
            const tx = MagicSpoon.buildTxChangeTrust(driver.Server, this.account, {
                asset: new StellarSdk.Asset(code, issuer),
                memo,
            });
            return await this.handlers.buildSignSubmit(tx);
        },
        removeTrust: async (code, issuer, memo) => {
            // Trust lines are removed by setting limit to 0
            const tx = MagicSpoon.buildTxChangeTrust(driver.Server, this.account, {
                asset: new StellarSdk.Asset(code, issuer),
                limit: '0',
                memo,
            });
            return await this.handlers.buildSignSubmit(tx);
        },
        createOffer: async (side, opts) => {
            const options = _.assign(opts, {
                baseBuying: driver.orderbook.data.baseBuying,
                counterSelling: driver.orderbook.data.counterSelling,
            });
            let tx;
            if (side === 'buy') {
                tx = MagicSpoon.buildTxCreateBuyOffer(driver.Server, this.account, options);
            } else if (side === 'sell') {
                tx = MagicSpoon.buildTxCreateSellOffer(driver.Server, this.account, options);
            } else {
                throw new Error(`Invalid side ${side}`);
            }

            const bssResult = await this.handlers.buildSignSubmit(tx);
            if (bssResult.status === 'finish') {
                bssResult.serverResult.then((res) => {
                    this.account.updateOffers();
                    return res;
                });
            }
            return bssResult;
        },
        // offers can be single or array of offers
        removeOffer: async (offers) => {
            const tx = MagicSpoon.buildTxRemoveOffer(driver.Server, this.account, offers);
            const bssResult = await this.handlers.buildSignSubmit(tx);
            if (bssResult.status === 'finish') {
                bssResult.serverResult.then((res) => {
                    this.account.updateOffers();
                    return res;
                });
            }
            return bssResult;
        },
        logout: () => {
            try {
                this.account.clearKeypair();
                delete this.account;
                init();
                window.location.reload();
            } catch (e) {
                window.location.reload();
            }
        },
        addUnknownAssetData: () => {
            const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];

            // period = days x hours x min x sec x ms
            const periodUpdate = 14 * 24 * 60 * 60 * 1000;

            const chainPromise = this.account.balances.reduce((chain, sdkBalance) => {
                const asset = directory.resolveAssetByAccountId(sdkBalance.asset_code, sdkBalance.asset_issuer);
                if (asset.domain !== 'unknown' || asset.code === undefined) {
                    return chain;
                }

                const assetData = unknownAssetsData.find(assetLocalItem => (
                    assetLocalItem.code === asset.code && assetLocalItem.issuer === asset.issuer
                ));

                if (assetData && ((new Date() - new Date(assetData.time)) < periodUpdate)) {
                    return chain;
                }

                if (assetData) {
                    unknownAssetsData.splice(unknownAssetsData.indexOf(assetData), 1);
                }

                return chain.then(newArray =>
                    this.handlers.loadUnknownAssetData(asset).then(res => [...newArray, res]),
                );
            }, Promise.resolve([]));

            chainPromise.then((arr) => {
                localStorage.setItem('unknownAssetsData', JSON.stringify([...unknownAssetsData, ...arr]));
                this.event.trigger();
            });
        },

        getDomainByIssuer: async (issuer) => {
            const account = await driver.Server.loadAccount(issuer);
            if (!account.home_domain) {
                return null;
            }
            return account.home_domain;
        },

        loadUnknownAssetData: (asset) => {
            const id = asset.code + asset.issuer;
            if (!this.promisesForMyltipleLoading[id]) {
                this.promisesForMyltipleLoading[id] = this.handlers.singleLoadUnknownAssetData(asset);
            }
            return this.promisesForMyltipleLoading[id];
        },

        singleLoadUnknownAssetData: async (asset) => {
            try {
                const homeDomain = await this.handlers.getDomainByIssuer(asset.issuer);

                if (homeDomain === null) {
                    throw new Error();
                }
                const toml = await StellarSdk.StellarTomlResolver.resolve(homeDomain);

                const currency = toml.CURRENCIES.find(cur =>
                    (cur.code.toUpperCase() === asset.code.toUpperCase() && cur.issuer === asset.issuer),
                );

                if (!currency) {
                    throw new Error();
                }

                const { image, host } = currency;
                const color = image && await this.handlers.getAverageColor(image, asset.code, homeDomain);

                // Stellarterm used only "image" and "host" fields;

                return {
                    code: asset.code,
                    issuer: asset.issuer,
                    host: homeDomain,
                    currency: {
                        host,
                        image,
                    },
                    color,
                    time: new Date(),
                };
            } catch (e) {
                return {
                    code: asset.code,
                    issuer: asset.issuer,
                    host: '',
                    currency: {},
                    color: '',
                    time: new Date(),
                };
            }
        },

        getAverageColor: (imageUrl, code, domain) => {
            const fac = new FastAverageColor();
            const img = document.createElement('img');
            img.src = `${imageUrl}?rnd${Math.random()}`;
            img.crossOrigin = 'Anonymous';

            return fac.getColorAsync(img)
                .then(col => col.hex)
                .catch(() => {
                    console.warn(`Can not calculate background color for ${code} (${domain}). Reason: CORS Policy`);
                    return '';
                });
        },
    };
}
