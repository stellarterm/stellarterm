import StellarSdk from 'stellar-sdk';
import BigNumber from 'bignumber.js';
import { post, get } from '../../api/request';
import { TOP_MARKETS_API } from '../../../env-consts';
import { ENDPOINTS, getEndpoint } from '../../api/endpoints';
import { getAssetString } from './Session';

const XDR_AMOUNT_COEFFICIENT = 0.0000001;
const SMART_ROUTING_MIN_AMOUNT = 100; // 100$
const SMART_ROUTING_FEE = 30; // 30%
const SMART_ROUTING_MAX_PRICE_IMPACT = -0.5;

export const FEE_ADDRESS = 'GAEGJFQYHAFZEAWHQ2ZIE4Z6OIZDSCXTOKFUEJ3QMBNOIJRVY3SXBVO6';

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

    // Path result
    // {
    //     isSmartRouting: boolean,
    //     type: 'send' or 'receive',
    //     extended_paths: array of {
    //          destinationAmount: number,
    //          sourceAmount: number,
    //          path: HORIZON PATH OBJECT,
    //          percent: number,
    //          readablePath: array of strings,
    //     },
    //     profit: number,
    //     fee_path: HORIZON PATH OBJECT,
    //     initial_sum: number,
    //     optimized_sum: number,
    // }

    // HORIZON PATH OBJECT
    // destination_amount: string
    // destination_asset_code: string
    // destination_asset_issuer: string
    // destination_asset_type: string
    // path: [{ asset_type: string, asset_code: string, asset_issuer: string }]
    // source_amount: string
    // source_asset_type: string

    getBestSendPath({ source, destination, sourceAmount, sourcePriceUSD, destinationPriceUSD }) {
        return this.driver.Server.strictSendPaths(source, sourceAmount, [destination])
            .call()
            .then(({ records }) => Swap.findMaxSendPath(records))
            .then(result => {
                const priceImpact = new BigNumber(result.destination_amount)
                    .times(new BigNumber(destinationPriceUSD))
                    .div(new BigNumber(result.source_amount))
                    .div(new BigNumber(sourcePriceUSD))
                    .minus(1)
                    .times(100)
                    .toNumber();

                if (
                    priceImpact <= SMART_ROUTING_MAX_PRICE_IMPACT &&
                    (sourceAmount * sourcePriceUSD >= SMART_ROUTING_MIN_AMOUNT)
                ) {
                    return Swap.getSmartRoutingPath(true, source, destination, sourceAmount);
                }

                return ({
                    isSmartRouting: false,
                    type: 'send',
                    extended_paths: [{
                        destinationAmount: Number(result.destination_amount),
                        sourceAmount: Number(result.source_amount),
                        path: result,
                        percent: 100,
                        readablePath: [
                            source.code,
                            ...result.path.map(({ asset_type: type, asset_code: code }) => (type === 'native' ? 'XLM' : code)),
                            destination.code,
                        ],
                    }],
                    profit: 0,
                    initial_sum: result.destination_amount,
                    optimized_sum: result.destination_amount,
                    fee_path: null,
                });
            });
    }

    getBestReceivePath({ source, destination, destinationAmount, destinationPriceUSD, sourcePriceUSD }) {
        return this.driver.Server.strictReceivePaths([source], destination, destinationAmount)
            .call()
            .then(({ records }) => Swap.findMinReceivePath(records))
            .then(result => {
                const priceImpact = new BigNumber(result.destination_amount)
                    .times(new BigNumber(destinationPriceUSD))
                    .div(new BigNumber(result.source_amount))
                    .div(new BigNumber(sourcePriceUSD))
                    .minus(1)
                    .times(100)
                    .toNumber();

                if (
                    priceImpact <= SMART_ROUTING_MAX_PRICE_IMPACT &&
                    (destinationAmount * destinationPriceUSD >= SMART_ROUTING_MIN_AMOUNT)
                ) {
                    return Swap.getSmartRoutingPath(false, source, destination, destinationAmount);
                }

                return ({
                    isSmartRouting: false,
                    type: 'receive',
                    extended_paths: [{
                        destinationAmount: Number(result.destination_amount),
                        sourceAmount: Number(result.source_amount),
                        path: result,
                        percent: 100,
                        readablePath: [
                            source.code,
                            ...result.path.map(({ asset_type: type, asset_code: code }) => (type === 'native' ? 'XLM' : code)),
                            destination.code,
                        ],
                    }],
                    profit: 0,
                    initial_sum: result.source_amount,
                    optimized_sum: result.source_amount,
                    fee_path: null,
                });
            });
    }

    static getSmartRoutingPath(isSend, source, destination, amount) {
        return get(getEndpoint(ENDPOINTS.SMART_ROUTING, {
            type: isSend ? 'send' : 'receive',
            source: getAssetString(source),
            destination: getAssetString(destination),
            amount,
            fee: SMART_ROUTING_FEE,
        })).then(result => Object.assign({}, result, {
            isSmartRouting: Boolean(Number(result.profit)),
        }));
    }

    getUsdPrices(source, destination) {
        const { USD_XLM } = this.driver.ticker.data._meta.externalPrices;

        const body = JSON.stringify({ asset_keys: [getAssetString(source), getAssetString(destination)] });

        const headers = { 'Content-Type': 'application/json' };

        return post(`${TOP_MARKETS_API}assets/native-prices/`, { headers, body })
            .then(({ results }) => {
                const sourcePrice = results.find(({ asset_code: code, asset_issuer: issuer }) =>
                    code === source.code && issuer === source.issuer);
                const destPrice =
                    results.find(({ asset_code: code, asset_issuer: issuer }) =>
                        code === destination.code && issuer === destination.issuer);

                return [
                    // eslint-disable-next-line no-nested-ternary
                    source.isNative() ?
                        USD_XLM :
                        (sourcePrice ?
                            new BigNumber(sourcePrice.close_native_price).times(new BigNumber(USD_XLM)).toNumber() :
                            null),
                    // eslint-disable-next-line no-nested-ternary
                    destination.isNative() ?
                        USD_XLM :
                        (destPrice ?
                            new BigNumber(destPrice.close_native_price).times(new BigNumber(USD_XLM)).toNumber() :
                            null),
                ];
            });
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
                        const itemValue = item.value();
                        const assetValue = itemValue.assetSold().value();

                        const assetCode = assetValue ?
                            assetValue.assetCode().toString() :
                            'native';

                        const assetIssuer = assetValue ?
                            assetValue.issuer().value().toString('hex') :
                            'native';

                        const amount = itemValue.amountSold().toNumber();

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
                        const itemValue = item.value();
                        const assetValue = itemValue.assetBought().value();

                        const assetCode = assetValue ?
                            assetValue.assetCode().toString() :
                            'native';

                        const assetIssuer = assetValue ?
                            assetValue.issuer().value().toString('hex') :
                            'native';

                        const amount = itemValue.amountBought().toNumber();

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

