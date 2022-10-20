import StellarSdk from 'stellar-sdk';
import BigNumber from 'bignumber.js';
import MagicSpoon from '../MagicSpoon';

const XDR_AMOUNT_COEFFICIENT = 0.0000001;

export default class Swap {
    static findMaxSendPath(records) {
        if (!records.length) {
            return null;
        }
        return records.reduce((acc, item) =>
            (Number(acc.destination_amount) > Number(item.destination_amount) ? acc : item));
    }

    static findMinReceivePath(records) {
        if (!records.length) {
            return null;
        }
        return records.reduce((acc, item) =>
            (Number(acc.source_amount) < Number(item.source_amount) ? acc : item));
    }

    constructor(driver) {
        this.driver = driver;
    }

    getBestSendPath(source, destination, sourceAmount) {
        return this.driver.Server.strictSendPaths(source, sourceAmount, [destination])
            .call()
            .then(({ records }) => Swap.findMaxSendPath(records));
    }

    getBestReceivePath(source, destination, destinationAmount) {
        return this.driver.Server.strictReceivePaths([source], destination, destinationAmount)
            .call()
            .then(({ records }) => Swap.findMinReceivePath(records));
    }

    async getAssetPriceUsd(asset) {
        const { USD_XLM } = this.driver.ticker.data._meta.externalPrices;
        if (asset.isNative()) {
            return USD_XLM;
        }
        const tickerAsset = this.driver.ticker.data.assets.find(
            ({ code, issuer }) => code === asset.code && issuer === asset.issuer,
        );

        if (tickerAsset) {
            return tickerAsset.price_USD;
        }

        const { records } = await MagicSpoon.getLast24hAggregationsWithStep15min(
            this.driver.Server,
            asset,
            StellarSdk.Asset.native(),
            1,
        );

        if (!records.length) {
            return null;
        }

        return new BigNumber(records[0].avg).times(new BigNumber(USD_XLM)).toNumber();
    }

    static getSendPathPaymentDestAmount(txRes) {
        const transactionResult = StellarSdk.xdr.TransactionResult.fromXDR(
            txRes.result_xdr,
            'base64',
        );

        // We need this cause search of ledger bumpSequence temp solution
        const foundPathStrictSendResults = transactionResult
            .result()
            .results()
            .filter(res => res._value._switch.name === 'pathPaymentStrictSend');

        let totalAmount = new BigNumber(0);
        foundPathStrictSendResults.forEach(result => {
            totalAmount = totalAmount.plus(
                result
                    .tr()
                    .pathPaymentStrictSendResult()
                    .success()
                    .offers()
                    .reverse()
                    .reduce((acc, item) => {
                        const isNative = item.value().assetSold().value() === undefined;

                        const assetCode = isNative ?
                            'native' :
                            item.value()
                                .assetSold()
                                .value()
                                .assetCode()
                                .toString();

                        const assetIssuer = isNative ?
                            'native' :
                            item.value()
                                .assetSold()
                                .value()
                                .issuer()
                                .value()
                                .toString('hex');

                        const amount = item.value().amountSold().toNumber();

                        if (acc.code === null) {
                            acc.code = assetCode;
                            acc.issuer = assetIssuer;

                            acc.amount = new BigNumber(amount).times(XDR_AMOUNT_COEFFICIENT).toNumber();

                            return acc;
                        }

                        if (acc.code !== assetCode || acc.issuer !== assetIssuer) {
                            return acc;
                        }

                        acc.amount += new BigNumber(amount).times(XDR_AMOUNT_COEFFICIENT).toNumber();

                        return acc;
                    }, { code: null, issuer: null, amount: 0 }).amount,
            );
        });

        return totalAmount.toFixed(7);
    }

    static getReceivePathPaymentSourceAmount(txRes) {
        const transactionResult = StellarSdk.xdr.TransactionResult.fromXDR(
            txRes.result_xdr,
            'base64',
        );

        // We need this cause search of ledger bumpSequence temp solution
        const foundPathStrictSendResults = transactionResult
            .result()
            .results()
            .filter(res => res._value._switch.name === 'pathPaymentStrictReceive');

        let totalAmount = new BigNumber(0);

        foundPathStrictSendResults.forEach(result => {
            totalAmount = totalAmount.plus(
                result
                    .tr()
                    .pathPaymentStrictReceiveResult()
                    .success()
                    .offers()
                    .reduce((acc, item) => {
                        const isNative = item.value().assetBought().value() === undefined;

                        const assetCode = isNative ?
                            'native' :
                            item.value()
                                .assetBought()
                                .value()
                                .assetCode()
                                .toString();

                        const assetIssuer = isNative ?
                            'native' :
                            item.value()
                                .assetBought()
                                .value()
                                .issuer()
                                .value()
                                .toString('hex');

                        const amount = item.value().amountBought().toNumber();

                        if (acc.code === null) {
                            acc.code = assetCode;
                            acc.issuer = assetIssuer;

                            acc.amount = new BigNumber(amount).times(XDR_AMOUNT_COEFFICIENT).toNumber();

                            return acc;
                        }

                        if (acc.code !== assetCode || acc.issuer !== assetIssuer) {
                            return acc;
                        }

                        acc.amount += new BigNumber(amount).times(XDR_AMOUNT_COEFFICIENT).toNumber();

                        return acc;
                    }, { code: null, issuer: null, amount: 0 }).amount,
            );
        });

        return totalAmount.toFixed(7);
    }
}

