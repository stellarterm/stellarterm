import _ from 'lodash';
import * as StellarSdk from 'stellar-sdk';
import directory from 'stellarterm-directory';
import Transport from '@ledgerhq/hw-transport-u2f';
import AppStellar from '@ledgerhq/hw-app-str';
import BigNumber from 'bignumber.js';
import TrezorConnect from 'trezor-connect';
import Stellarify from '../lib/Stellarify';
import TransformTrezorTransaction from './TransformTrezorTransaction';
import ErrorHandler from './ErrorHandler';

// Spoonfed Stellar-SDK: Super easy to use higher level Stellar-Sdk functions
// Simplifies the objects to what is necessary. Listens to updates automagically.
// It's in the same file as the driver because the driver is the only one that
// should ever use the spoon.

const fee = 10000;
const _hexToByteArray = (str) => {
    const result = [];
    let hex = str;
    while (hex.length >= 2) {
        result.push(parseInt(hex.substring(0, 2), 16));
        hex = hex.substring(2, hex.length);
    }
    return new Uint8Array(result);
};


const MagicSpoon = {
    async Account(Server, keypair, opts, onUpdate) {
        const sdkAccount = await Server.loadAccount(keypair.publicKey());
        this.bip32Path = opts.bip32Path;
        this.authType = opts.authType;

        sdkAccount.signWithLedger = (transaction) => {
            console.log('Sending to Ledger to sign');
            return Transport.create()
                .then(transport => new AppStellar(transport))
                .then(app => app.signTransaction(this.bip32Path, transaction.signatureBase()))
                .then((result) => {
                    const signature = result.signature;
                    const hint = keypair.signatureHint();
                    const decorated = new StellarSdk.xdr.DecoratedSignature({ hint, signature });
                    transaction.signatures.push(decorated);
                    return transaction;
                })
                .catch((error) => {
                    console.error(error);
                    return Promise.reject(error);
                });
        };

        sdkAccount.signWithTrezor = (tx) => {
            console.log('Sending to Trezor to sign');
            const params = TransformTrezorTransaction(this.bip32Path, tx);

            return TrezorConnect.stellarSignTransaction(params)
                .then((result) => {
                    if (result.success) {
                        const signature = _hexToByteArray(result.payload.signature);
                        const hint = keypair.signatureHint();
                        const decorated = new StellarSdk.xdr.DecoratedSignature({ hint, signature });
                        tx.signatures.push(decorated);

                        return tx;
                    }
                    return Promise.reject(result.payload);
                });
        };

        sdkAccount.signWithSecret = (transaction) => {
            console.log('Signing with local keypair');
            return transaction.sign(keypair);
        };

        sdkAccount.getLumenBalance = () => sdkAccount.balances[sdkAccount.balances.length - 1].balance;

        // Expects StellarSdk.Asset
        // Returns null if there is no trust
        // Returns string of balance if exists
        sdkAccount.getBalance = (targetAsset) => {
            let targetBalance = null;
            if (targetAsset.isNative()) {
                _.each(sdkAccount.balances, (balance) => {
                    if (balance.asset_type === 'native') {
                        targetBalance = balance.balance;
                    }
                });
            } else {
                _.each(sdkAccount.balances, (balance) => {
                    if (
                        balance.asset_code === targetAsset.getCode() &&
                        balance.asset_issuer === targetAsset.getIssuer()
                    ) {
                        targetBalance = balance.balance;
                    }
                });
            }
            return targetBalance;
        };

        sdkAccount.getReservedBalance = (targetAsset) => {
            const isTargetNative = targetAsset.isNative();
            const asset = sdkAccount.balances.find((item) => {
                const isNative = isTargetNative && item.asset_type === 'native';
                return (
                    isNative ||
                    (item.asset_code === targetAsset.getCode() && item.asset_issuer === targetAsset.getIssuer())
                );
            });

            return asset ? parseFloat(asset.selling_liabilities).toFixed(7) : null;
        };

        sdkAccount.isOrderExists = (targetAsset) => {
            const asset = sdkAccount.balances.find(
                item => item.asset_code === targetAsset.getCode() && item.asset_issuer === targetAsset.getIssuer(),
            );
            return asset
                ? asset.selling_liabilities !== '0.0000000' || asset.buying_liabilities !== '0.0000000'
                : false;
        };

        // Should always return at least one item (which is lumens)
        sdkAccount.getSortedBalances = (options) => {
            const sortOptions = options || {};

            const nativeBalances = [];
            const knownBalances = [];
            const unknownBalances = [];
            sdkAccount.balances.forEach((sdkBalance) => {
                if (sdkBalance.asset_type === 'native') {
                    if (sortOptions.hideNative) {
                        return null;
                    }
                    return nativeBalances.push({
                        code: 'XLM',
                        issuer: null,
                        balance: sdkBalance.balance,
                        sdkBalance,
                    });
                }
                const newBalance = {
                    // Yay shoes :P
                    code: sdkBalance.asset_code,
                    issuer: sdkBalance.asset_issuer,
                    balance: sdkBalance.balance,
                };
                const asset = directory.resolveAssetByAccountId(newBalance.code, newBalance.issuer);
                if (asset.domain === 'unknown') {
                    return unknownBalances.push(newBalance);
                }
                return knownBalances.push(newBalance);
            });

            if (sortOptions.onlyUnknown) {
                return unknownBalances;
            }

            return nativeBalances.concat(knownBalances, unknownBalances);
        };

        const accountEventsClose = Server.accounts()
            .accountId(keypair.publicKey())
            .stream({
                onmessage: (res) => {
                    let updated = false;
                    if (!_.isEqual(sdkAccount.balances, res.balances)) {
                        sdkAccount.balances = res.balances;
                        sdkAccount.subentry_count = res.subentry_count;
                        sdkAccount.updateOffers();

                        updated = true;
                    }

                    if (!_.isEqual(sdkAccount.signers, res.signers)) {
                        sdkAccount.signers = res.signers;
                    }
                    if (!_.isEqual(sdkAccount.thresholds, res.thresholds)) {
                        sdkAccount.thresholds = res.thresholds;
                    }

                    // We shouldn't pull latest sequence number.
                    // It'll only go out of sync if user is using the account in two places

                    if (updated) {
                        onUpdate();
                    }
                },
            });

        sdkAccount.decrementSequence = () => {
            sdkAccount._baseAccount.sequence = sdkAccount._baseAccount.sequence.sub(1);
            window.s = sdkAccount._baseAccount.sequence;
            sdkAccount.sequence = sdkAccount._baseAccount.sequence.toString();
        };

        sdkAccount.refresh = async () => {
            const newAccount = await Server.loadAccount(keypair.publicKey());
            sdkAccount.applyNewBalances(newAccount.balances);
            sdkAccount.inflation_destination = newAccount.inflation_destination;
            sdkAccount.subentry_count = newAccount.subentry_count;
            sdkAccount.home_domain = newAccount.home_domain;
            sdkAccount.applyNewSigners(newAccount.signers);
            sdkAccount.applyNewThresholds(newAccount.thresholds);
        };

        sdkAccount.applyNewSigners = (newSigners) => {
            let updated = false;
            if (!_.isEqual(sdkAccount.signers, newSigners)) {
                sdkAccount.signers = newSigners;
                updated = true;
            }
            if (updated) {
                onUpdate();
            }
        };

        sdkAccount.applyNewThresholds = (newThresholds) => {
            let updated = false;
            if (!_.isEqual(sdkAccount.thresholds, newThresholds)) {
                sdkAccount.thresholds = newThresholds;
                updated = true;
            }
            if (updated) {
                onUpdate();
            }
        };

        sdkAccount.applyNewBalances = (newBalances) => {
            let updated = false;
            if (!_.isEqual(sdkAccount.balances, newBalances)) {
                sdkAccount.balances = newBalances;
                updated = true;
            }

            if (updated) {
                onUpdate();
            }
        };

        sdkAccount.explainReserve = () => {
            const entriesTrustlines = sdkAccount.balances.length - 1;
            const entriesOffers = Object.keys(sdkAccount.offers).length;
            const entriesSigners = sdkAccount.signers.length - 1;
            const entriesOthers = sdkAccount.subentry_count - entriesTrustlines - entriesOffers - entriesSigners;
            const inActiveOffers = Number(sdkAccount.getReservedBalance(StellarSdk.Asset.native()));
            const reserveItems = [{
                reserveType: 'Base reserve',
                typeCount: 0,
                reservedXLM: 1,
            }, {
                reserveType: 'Extra',
                typeCount: 0,
                reservedXLM: 0.5,
            }, {
                reserveType: 'XLM in active offers',
                typeCount: 0,
                reservedXLM: inActiveOffers,
            }, {
                reserveType: 'Trustlines',
                typeCount: entriesTrustlines,
                reservedXLM: entriesTrustlines * 0.5,
            }, {
                reserveType: 'Offers',
                typeCount: entriesOffers,
                reservedXLM: entriesOffers * 0.5,
            }, {
                reserveType: 'Signers',
                typeCount: entriesSigners,
                reservedXLM: entriesSigners * 0.5,
            }, {
                reserveType: 'Others',
                typeCount: entriesOthers,
                reservedXLM: entriesOthers * 0.5,
            }];

            return {
                reserveItems,
                totalReservedXLM: _.sumBy(reserveItems, 'reservedXLM'),
            };
        };

        // Will always be less than or equal to the current balance
        sdkAccount.calculatePaddedReserve = () => {
            const networkReserve = (2 + sdkAccount.subentry_count) * 0.5;
            const extra = 0.5;
            return networkReserve + extra;
        };

        sdkAccount.maxLumenSpend = () => {
            const balance = sdkAccount.getLumenBalance();
            const extraFeeReserve = 0.01;
            const reserve = sdkAccount.calculatePaddedReserve() + extraFeeReserve;
            if (reserve > balance) {
                return 0;
            }
            return new BigNumber(balance).minus(reserve).toFixed(7);
        };

        sdkAccount.offers = {};

        // Horizon offers for account doesn't return us updates. So we will have to manually update it.
        // We won't miss any offers assuming that the user only updates their offers through the client
        // with just one window open at a time
        sdkAccount.updateOffers = () =>
            Server.offers()
                .forAccount(keypair.publicKey())
                .limit(200) // TODO: Keep iterating through next() to show more than 100 offers
                .order('desc')
                .call()
                .then((res) => {
                    const hasNullDate = res.records.find(offer => offer.last_modified_time === null);
                    if (hasNullDate) {
                        return null;
                    }
                    const newOffers = {};
                    _.each(res.records, (offer) => {
                        newOffers[offer.id] = offer;
                    });
                    sdkAccount.offers = newOffers;
                    onUpdate();
                    return null;
                });
        sdkAccount.updateOffers();

        sdkAccount.close = () => {
            accountEventsClose();
        };

        sdkAccount.clearKeypair = () => {
            MagicSpoon.overwrite(keypair._secretKey);
            MagicSpoon.overwrite(keypair._secretSeed);
        };

        return sdkAccount;
    },
    Orderbook(Server, baseBuying, counterSelling, onUpdate) {
        // Orderbook is an object that keeps track of the orderbook for you.
        // All the driver needs to do is remember to call the close function
        this.ready = false;
        // Initial orderbook load
        Server.orderbook(baseBuying, counterSelling)
            .call()
            .then((orderbook) => {
                this.asks = orderbook.asks;
                this.bids = orderbook.bids;
                this.baseBuying = baseBuying;
                this.counterSelling = counterSelling;

                MagicSpoon.pairTrades(Server, baseBuying, counterSelling, 200).then(({ records }) => {
                    this.marketTradesHistory = records;
                    this.ready = true;
                    onUpdate(() => {});
                });
            });

        const closeFunc = Server.orderbook(baseBuying, counterSelling).stream({
            onmessage: (res) => {
                let updated = false;
                if (!_.isEqual(this.bids, res.bids)) {
                    this.bids = res.bids;
                    updated = true;
                }
                if (!_.isEqual(this.asks, res.asks)) {
                    this.asks = res.asks;
                    updated = true;
                }
                if (updated) {
                    onUpdate(closeFunc);
                }
            },
        });
    },

    closeOrderbookStreaming(Server) {
        Server.orderbook.close();
    },

    async tradeAggregation(Server, baseBuying, counterSelling, RESOLUTION, LIMIT) {
        const limit = LIMIT || 100;
        const START_TIME = 1514764800; // 01/01/2018
        const END_TIME = Date.now() + 86400000; // Current time + 1 day
        // TODO: Iteration throught next() with binding to chart scroll
        return Server.tradeAggregation(baseBuying, counterSelling, START_TIME, END_TIME, RESOLUTION * 1000, 0)
            .limit(limit)
            .order('desc')
            .call()
            .then(res => res)
            .catch((error) => {
                console.error(ErrorHandler(error));
            });
    },
    pairTrades(Server, baseBuying, counterSelling, LIMIT) {
        const limit = LIMIT || 100;

        return Server.trades()
            .forAssetPair(baseBuying, counterSelling)
            .limit(limit)
            .order('desc')
            .call()
            .catch((error) => {
                console.error(error);
            });
    },
    // opts.baseBuying -- StellarSdk.Asset (example: XLM)
    // opts.counterSelling -- StellarSdk.Asset (example: USD)
    // opts.price -- Exchange ratio selling/buying
    // opts.amount -- Here, it's relative to the base (JS-sdk does: Total amount selling)
    // opts.type -- String of either 'buy' or 'sell' (relative to base currency)
    // opts.offerId - for edit existing offer
    buildTxCreateBuyOffer(Server, spoonAccount, opts) {
        const bigOptsPrice = new BigNumber(opts.price).toPrecision(15);
        const bigOptsAmount = new BigNumber(opts.amount).toPrecision(15);

        console.log(`Creating *BUY* offer at price ${opts.price}`);

        const sdkBuying = opts.baseBuying; // ex: lumens
        const sdkSelling = opts.counterSelling; // ex: USD
        const sdkPrice = new BigNumber(bigOptsPrice);
        const sdkAmount = new BigNumber(bigOptsAmount);
        const offerId = opts.offerId || 0; // 0 for new offer

        // create offer as ManageSellOffer for Ledger and Trezor devices
        // because manageBuyOffer is unsupported yet
        // https://github.com/LedgerHQ/ledger-app-stellar/
        // https://github.com/trezor/connect
        if (this.authType === 'ledger' || this.authType === 'trezor') {
            const operationOpts = {
                buying: sdkBuying,
                selling: sdkSelling,
                amount: new BigNumber(bigOptsAmount).times(bigOptsPrice).toFixed(7),
                price: new BigNumber(1).dividedBy(bigOptsPrice),
                offerId,
            };
            return new StellarSdk.TransactionBuilder(spoonAccount,
                { fee, networkPassphrase: window.networkPassphrase })
                .addOperation(StellarSdk.Operation.manageSellOffer(operationOpts))
                .setTimeout(Server.transactionTimeout);
        }

        const operationOpts = {
            buying: sdkBuying,
            selling: sdkSelling,
            buyAmount: String(sdkAmount),
            price: String(sdkPrice),
            offerId,
        };
        return new StellarSdk.TransactionBuilder(spoonAccount,
            { fee, networkPassphrase: window.networkPassphrase })
            .addOperation(StellarSdk.Operation.manageBuyOffer(operationOpts))
            .setTimeout(Server.transactionTimeout);
    },

    buildTxCreateSellOffer(Server, spoonAccount, opts) {
        const bigOptsPrice = new BigNumber(opts.price).toPrecision(15);
        const bigOptsAmount = new BigNumber(opts.amount).toPrecision(15);

        console.log(`Creating *SELL* offer at price ${opts.price}`);

        const sdkBuying = opts.counterSelling; // ex: USD
        const sdkSelling = opts.baseBuying; // ex: lumens
        const sdkPrice = new BigNumber(bigOptsPrice);
        const sdkAmount = new BigNumber(bigOptsAmount);
        const offerId = opts.offerId || 0; // 0 for new offer

        const operationOpts = {
            buying: sdkBuying,
            selling: sdkSelling,
            amount: String(sdkAmount),
            price: String(sdkPrice),
            offerId,
        };
        return new StellarSdk.TransactionBuilder(spoonAccount,
            { fee, networkPassphrase: window.networkPassphrase })
            .addOperation(StellarSdk.Operation.manageSellOffer(operationOpts))
            .setTimeout(Server.transactionTimeout);
    },

    async buildTxSendPayment(Server, spoonAccount, opts) {
        // sendPayment will detect if the account is a new account. If so, then it will
        // be a createAccount operation
        let transaction = new StellarSdk.TransactionBuilder(spoonAccount,
            { fee, networkPassphrase: window.networkPassphrase });
        try {
            // We need to check the activation of the destination,
            // if the account is not activated, it will be created in catch with createAccount
            await Server.loadAccount(opts.destination);

            transaction = transaction
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination: opts.destination,
                        asset: opts.asset,
                        amount: opts.amount,
                    }),
                )
                .setTimeout(Server.transactionTimeout);
        } catch (e) {
            if (!opts.asset.isNative()) {
                throw new Error(
                    'Destination account does not exist. To create it, you must send at least 1 XLM.',
                );
            }
            transaction = transaction
                .addOperation(
                    StellarSdk.Operation.createAccount({
                        destination: opts.destination,
                        startingBalance: opts.amount,
                    }),
                )
                .setTimeout(Server.transactionTimeout);
        }

        if (opts.memo) {
            transaction = transaction.addMemo(Stellarify.memo(opts.memo.type, opts.memo.content));
        }

        return transaction;
    },
    buildTxSetOptions(Server, spoonAccount, opts) {
        const options = Array.isArray(opts) ? opts : [opts];
        let transaction = new StellarSdk.TransactionBuilder(spoonAccount,
            { fee, networkPassphrase: window.networkPassphrase });

        options.forEach((option) => {
            transaction = transaction.addOperation(StellarSdk.Operation.setOptions(option));
        });
        // DONT call .build()

        return transaction.setTimeout(Server.transactionTimeout);
    },
    buildTxChangeTrust(Server, spoonAccount, opts) {
        let sdkLimit;
        if (typeof opts.limit === 'string' || opts.limit instanceof String) {
            sdkLimit = opts.limit;
        } else if (opts.limit !== undefined) {
            throw new Error('changeTrust opts.limit must be a string');
        }

        const operationOpts = {
            asset: opts.asset,
            limit: sdkLimit,
        };
        let transaction = new StellarSdk.TransactionBuilder(spoonAccount,
            { fee, networkPassphrase: window.networkPassphrase })
            .addOperation(StellarSdk.Operation.changeTrust(operationOpts))
            .setTimeout(Server.transactionTimeout);

        if (opts.memo) {
            transaction = transaction.addMemo(Stellarify.memo(opts.memo.memoType, opts.memo.memo));
        }

        return transaction;
        // DONT call .build()
    },
    buildTxRemoveOffer(Server, spoonAccount, opts) {
        const offers = Array.isArray(opts) ? opts : [opts];
        function parseAsset(asset) {
            return asset.asset_type === 'native'
                ? StellarSdk.Asset.native()
                : new StellarSdk.Asset(asset.asset_code, asset.asset_issuer);
        }

        const transaction = new StellarSdk.TransactionBuilder(spoonAccount,
            { fee, networkPassphrase: window.networkPassphrase });
        offers.forEach((offer) => {
            transaction.addOperation(StellarSdk.Operation.manageSellOffer({
                buying: parseAsset(offer.buying),
                selling: parseAsset(offer.selling),
                amount: '0',
                price: '1',
                offerId: offer.id,
            }));
        });
        return transaction.setTimeout(Server.transactionTimeout);
        // DONT call .build()
    },

    overwrite(buffer) {
        if (buffer === undefined) {
            // When logging in with Ledger, secret key is not stored
            return;
        }
        // Overwrite a buffer with random numbers
        // In JavaScript, nothing is guaranteed, but at least it's worth a try
        // This probably doesn't do anything that helpful
        for (let iteration = 0; iteration < 10; iteration += 1) {
            for (let i = 0; i < buffer.length; i += 1) {
                buffer[i] = Math.round(Math.random() * 255);
            }
        }
    },
};

export default MagicSpoon;
