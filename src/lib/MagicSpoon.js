/* eslint-disable no-console */
import _ from 'lodash';
import * as StellarSdk from 'stellar-sdk';
import directory from 'stellarterm-directory';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import AppStellar from '@ledgerhq/hw-app-str';
import BigNumber from 'bignumber.js';
import TrezorConnect from 'trezor-connect';
import { signTransaction } from '@stellar/freighter-api';
import TransformTrezorTransaction from 'trezor-connect/lib/plugins/stellar/plugin';
import ErrorHandler from './ErrorHandler';


// Spoonfed Stellar-SDK: Super easy to use higher level Stellar-Sdk functions
// Simplifies the objects to what is necessary. Listens to updates automagically.
// It's in the same file as the driver because the driver is the only one that
// should ever use the spoon.

const PERIOD_24H = 86400;

const _hexToByteArray = str => {
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
        this.Server = Server;
        const sdkAccount = await this.Server.loadAccount(keypair.publicKey());
        this.bip32Path = opts.bip32Path;
        this.authType = opts.authType;

        sdkAccount.signWithLedger = transaction => {
            console.log('Sending to Ledger to sign');
            return TransportWebUSB.create()
                .then(transport => new AppStellar(transport))
                .then(app => app.signTransaction(this.bip32Path, transaction.signatureBase()))
                .then(result => {
                    const signature = result.signature;
                    const hint = keypair.signatureHint();
                    const decorated = new StellarSdk.xdr.DecoratedSignature({ hint, signature });
                    transaction.signatures.push(decorated);
                    return transaction;
                })
                .catch(error => {
                    console.error(error);
                    return Promise.reject(error);
                });
        };

        sdkAccount.signWithTrezor = tx => {
            console.log('Sending to Trezor to sign');
            const params = TransformTrezorTransaction(this.bip32Path, tx);

            return TrezorConnect.stellarSignTransaction(params).then(result => {
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

        sdkAccount.signWithFreighter = async tx => {
            console.log('Signing with Freighter extension');
            try {
                const result = await signTransaction(tx.toEnvelope().toXDR('base64'));
                return new StellarSdk.Transaction(result, this.Server.networkPassphrase);
            } catch (e) {
                return Promise.reject(e);
            }
        };

        sdkAccount.signWithSecret = transaction => {
            console.log('Signing with local keypair');
            return transaction.sign(keypair);
        };

        sdkAccount.getLumenBalanceInstance = () => sdkAccount.balances.find(({ asset_type: assetType }) => assetType === 'native');

        sdkAccount.getAssetBalanceInstance = targetAsset => {
            if (targetAsset.isNative()) {
                return sdkAccount.getLumenBalanceInstance();
            }

            const assetBalance = sdkAccount.balances.find(({ asset_code: assetCode, asset_issuer: assetIssuer }) => (
                assetCode === targetAsset.getCode() && assetIssuer === targetAsset.getIssuer()
            ));

            return assetBalance || null;
        };

        sdkAccount.getLumenBalance = () => sdkAccount.getLumenBalanceInstance().balance;

        /**
         * Returns null if there is no trust
         * Returns string of balance if exists
         * @param targetAsset {StellarSdk.Asset}
         * @returns {string|null}
         */
        sdkAccount.getBalance = targetAsset => {
            const assetBalance = sdkAccount.getAssetBalanceInstance(targetAsset);

            return assetBalance ? assetBalance.balance : null;
        };

        sdkAccount.getReservedBalance = targetAsset => {
            const assetBalance = sdkAccount.getAssetBalanceInstance(targetAsset);

            return assetBalance ? parseFloat(assetBalance.selling_liabilities).toFixed(7) : null;
        };

        sdkAccount.isOrderExists = targetAsset => {
            const assetBalance = sdkAccount.getAssetBalanceInstance(targetAsset);

            return assetBalance
                ? assetBalance.selling_liabilities !== '0.0000000' || assetBalance.buying_liabilities !== '0.0000000'
                : false;
        };

        // Should always return at least one item (which is lumens)
        sdkAccount.getSortedBalances = options => {
            const sortOptions = options || {};

            const nativeBalances = [];
            const knownBalances = [];
            const unknownBalances = [];
            sdkAccount.balances.forEach(sdkBalance => {
                if (sdkBalance.asset_type === 'liquidity_pool_shares') {
                    return;
                }
                if (sdkBalance.asset_type === 'native') {
                    if (sortOptions.hideNative) {
                        return;
                    }
                    nativeBalances.push({
                        code: 'XLM',
                        issuer: null,
                        balance: sdkBalance.balance,
                        sdkBalance,
                    });
                    return;
                }
                const newBalance = {
                    // Yay shoes :P
                    code: sdkBalance.asset_code,
                    issuer: sdkBalance.asset_issuer,
                    balance: sdkBalance.balance,
                };
                const asset = directory.resolveAssetByAccountId(newBalance.code, newBalance.issuer);
                if (asset.domain === 'unknown') {
                    unknownBalances.push(newBalance);
                    return;
                }
                knownBalances.push(newBalance);
            });

            if (sortOptions.onlyUnknown) {
                return unknownBalances;
            }

            return nativeBalances.concat(knownBalances, unknownBalances);
        };

        const startAccountStream = server => server.accounts()
            .accountId(keypair.publicKey())
            .stream({
                onmessage: res => {
                    let updated = false;
                    if (!_.isEqual(sdkAccount.balances, res.balances)) {
                        sdkAccount.balances = res.balances;
                        sdkAccount.updateOffers();
                        updated = true;
                    }

                    if (sdkAccount.subentry_count !== res.subentry_count) {
                        sdkAccount.subentry_count = res.subentry_count;
                        updated = true;
                    }

                    if (sdkAccount.num_sponsoring !== res.num_sponsoring) {
                        sdkAccount.num_sponsoring = res.num_sponsoring;
                        updated = true;
                    }

                    if (sdkAccount.num_sponsored !== res.num_sponsored) {
                        sdkAccount.num_sponsored = res.num_sponsored;
                        updated = true;
                    }

                    if (!_.isEqual(sdkAccount.signers, res.signers)) {
                        sdkAccount.signers = res.signers;
                    }
                    if (!_.isEqual(sdkAccount.thresholds, res.thresholds)) {
                        sdkAccount.thresholds = res.thresholds;
                    }

                    if (updated) {
                        onUpdate();
                    }
                },
            });

        let accountEventsClose = startAccountStream(this.Server);

        sdkAccount.restartAccountStream = server => {
            accountEventsClose();
            this.Server = server;
            accountEventsClose = startAccountStream(server);
        };

        sdkAccount.updateSequence = async () => {
            const newAccount = await this.Server.loadAccount(keypair.publicKey());
            sdkAccount.sequence = newAccount.sequence;
            sdkAccount._baseAccount = new StellarSdk.Account(newAccount.id, newAccount.sequence);
        };

        sdkAccount.refresh = async () => {
            const newAccount = await this.Server.loadAccount(keypair.publicKey());
            sdkAccount.applyNewBalances(newAccount.balances);
            sdkAccount.subentry_count = newAccount.subentry_count;
            sdkAccount.num_sponsoring = newAccount.num_sponsoring;
            sdkAccount.num_sponsored = newAccount.num_sponsored;
            sdkAccount.home_domain = newAccount.home_domain;
            sdkAccount.applyNewSigners(newAccount.signers);
            sdkAccount.applyNewThresholds(newAccount.thresholds);
        };

        sdkAccount.applyNewSigners = newSigners => {
            let updated = false;
            if (!_.isEqual(sdkAccount.signers, newSigners)) {
                sdkAccount.signers = newSigners;
                updated = true;
            }
            if (updated) {
                onUpdate();
            }
        };

        sdkAccount.applyNewThresholds = newThresholds => {
            let updated = false;
            if (!_.isEqual(sdkAccount.thresholds, newThresholds)) {
                sdkAccount.thresholds = newThresholds;
                updated = true;
            }
            if (updated) {
                onUpdate();
            }
        };

        sdkAccount.applyNewBalances = newBalances => {
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
            const { entriesTrustlines, entriesLiquidityTrustlines } = sdkAccount.balances.reduce((acc, balance) => {
                if (balance.asset_issuer) {
                    acc.entriesTrustlines += 1;
                    return acc;
                } else if (balance.asset_type === 'liquidity_pool_shares') {
                    acc.entriesLiquidityTrustlines += 1;
                    return acc;
                }
                return acc;
            }, {
                entriesTrustlines: 0,
                entriesLiquidityTrustlines: 0,
            });

            const entriesOffers = Object.keys(sdkAccount.offers).length;
            const entriesSigners = sdkAccount.signers.length - 1;
            const entriesOthers = sdkAccount.subentry_count
                - entriesTrustlines - (entriesLiquidityTrustlines * 2) - entriesOffers - entriesSigners;
            const inActiveOffers = Number(sdkAccount.getReservedBalance(StellarSdk.Asset.native()));
            const numSponsoring = sdkAccount.num_sponsoring;
            const numSponsored = sdkAccount.num_sponsored;

            const reserveItems = [
                {
                    reserveType: 'Base reserve',
                    typeCount: 0,
                    reservedXLM: 1,
                },
                {
                    reserveType: 'Extra',
                    typeCount: 0,
                    reservedXLM: 0.5,
                },
                {
                    reserveType: 'XLM in active offers',
                    typeCount: 0,
                    reservedXLM: inActiveOffers,
                },
                {
                    reserveType: 'Trustlines',
                    typeCount: entriesTrustlines,
                    reservedXLM: entriesTrustlines * 0.5,
                },
                {
                    reserveType: 'Liquidity pool trustlines',
                    typeCount: entriesLiquidityTrustlines,
                    reservedXLM: entriesLiquidityTrustlines * 1,
                },
                {
                    reserveType: 'Offers',
                    typeCount: entriesOffers,
                    reservedXLM: entriesOffers * 0.5,
                },
                {
                    reserveType: 'Signers',
                    typeCount: entriesSigners,
                    reservedXLM: entriesSigners * 0.5,
                },
                {
                    reserveType: 'Account data',
                    typeCount: entriesOthers,
                    reservedXLM: entriesOthers * 0.5,
                },
                {
                    reserveType: 'Sponsoring entries for others',
                    typeCount: numSponsoring,
                    reservedXLM: numSponsoring * 0.5,
                },
                {
                    reserveType: 'Entries sponsored for account',
                    typeCount: -numSponsored,
                    reservedXLM: -numSponsored * 0.5,
                },
            ];

            return {
                reserveItems,
                totalReservedXLM: _.sumBy(reserveItems, 'reservedXLM'),
            };
        };

        // Will always be less than or equal to the current balance
        sdkAccount.calculatePaddedReserve = () => {
            const networkReserve =
                // eslint-disable-next-line no-mixed-operators
                (2 + sdkAccount.subentry_count + sdkAccount.num_sponsoring - sdkAccount.num_sponsored) * 0.5;
            const extra = 0.5;
            return networkReserve + extra;
        };

        sdkAccount.maxLumenSpend = () => {
            const balance = sdkAccount.getLumenBalance();
            const extraFeeReserve = 0.022;
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
            this.Server.offers()
                .forAccount(keypair.publicKey())
                .limit(200) // TODO: Keep iterating through next() to show more than 100 offers
                .order('desc')
                .call()
                .then(res => {
                    sdkAccount.offers = res.records.reduce((acc, offer) => {
                        acc[offer.id] = offer;
                        if (offer.last_modified_time === null) {
                            acc[offer.id].last_modified_time = new Date();
                        }
                        return acc;
                    }, {});
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
            .limit(200)
            .call()
            .then(orderbook => {
                this.asks = orderbook.asks;
                this.bids = orderbook.bids;
                this.baseBuying = baseBuying;
                this.counterSelling = counterSelling;

                this.ready = true;
                onUpdate();
            });

        this.closeOrderbookStream = Server.orderbook(baseBuying, counterSelling).limit(200).stream({
            onmessage: res => {
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
                    onUpdate();
                }
            },
        });
    },

    LastTrades(Server, baseBuying, counterSelling, onUpdate) {
        MagicSpoon.pairTrades(Server, baseBuying, counterSelling, 200).then(result => {
            const { records } = result || [];
            this.marketTradesHistory = records;
            onUpdate({ lastTrades: true, lastTradesInit: true });

            this.closeLastTradesStream = Server.trades()
                .forAssetPair(baseBuying, counterSelling)
                .order('asc')
                .cursor('now')
                .stream({
                    onmessage: trade => {
                        this.marketTradesHistory = [trade, ...this.marketTradesHistory];
                        onUpdate({ lastTrades: true });
                    },
                    onerror: error => {
                        console.log(error);
                        this.closeLastTradesStream();
                    },
                });
        });
    },

    async tradeAggregation(Server, baseBuying, counterSelling, START_TIME, END_TIME, RESOLUTION, LIMIT) {
        const limit = LIMIT || 100;
        // TODO: Iteration throught next() with binding to chart scroll
        return Server.tradeAggregation(
            baseBuying,
            counterSelling,
            START_TIME * 1000,
            ((END_TIME * 1000) + (RESOLUTION * 1000)),
            RESOLUTION * 1000, 0,
        )
            .limit(limit)
            .order('desc')
            .call()
            .then(res => res)
            .catch(error => {
                console.error(ErrorHandler(error));
            });
    },
    async getLast24hAggregationsWithStep15min(Server, base, counter) {
        const RESOLUTION_15_MINUTES = 900;
        const endDate = Math.round(Date.now() / 1000);
        const startDate = endDate - PERIOD_24H;

        return this.tradeAggregation(Server, base, counter, startDate, endDate, RESOLUTION_15_MINUTES, 100);
    },
    async getLastMinuteAggregation(Server, base, counter) {
        const RESOLUTION_MINUTE = 60;

        const endDate = Math.round(Date.now() / 1000);
        const startDate = endDate - PERIOD_24H;

        return this.tradeAggregation(Server, base, counter, startDate, endDate, RESOLUTION_MINUTE, 1);
    },
    pairTrades(Server, baseBuying, counterSelling, LIMIT) {
        const limit = LIMIT || 100;

        return Server.trades()
            .forAssetPair(baseBuying, counterSelling)
            .limit(limit)
            .order('desc')
            .call()
            .catch(error => {
                console.error(error);
            });
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
