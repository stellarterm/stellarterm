import * as StellarSdk from '@stellar/stellar-sdk';
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
                        path: result.path,
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
                    (Number(result.source_amount) * sourcePriceUSD >= SMART_ROUTING_MIN_AMOUNT)
                ) {
                    return Swap.getSmartRoutingPath(false, source, destination, destinationAmount);
                }

                return ({
                    isSmartRouting: false,
                    type: 'receive',
                    extended_paths: [{
                        destinationAmount: Number(result.destination_amount),
                        sourceAmount: Number(result.source_amount),
                        path: result.path,
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
                    this.getUsdPrice(source, sourcePrice),
                    this.getUsdPrice(destination, destPrice),
                ];
            });
    }

    getUsdPrice(asset, price) {
        const { USD_XLM } = this.driver.ticker.data._meta.externalPrices;

        const { close_native_price: nativePrice } = price || {};

        if (asset.isNative()) {
            return USD_XLM;
        }

        return nativePrice ?
            new BigNumber(nativePrice).times(new BigNumber(USD_XLM)).toNumber() :
            null;
    }

    /**
     * Get the final amount of the send-side swap transaction
     * @param txRes: Horizon.SubmitTransactionResponse swap transaction result
     * @return {string} swap destination amount
     */
    static getSendSwapDestAmount(txRes) {
        const transactionResult = StellarSdk.xdr.TransactionResult.fromXDR(
            txRes.result_xdr,
            'base64',
        );

        const sendSwapOps = transactionResult
            .result()
            .results()
            // use only pathPaymentStrictSend operations
            .filter(item => item.value().switch().name === StellarSdk.xdr.OperationType.pathPaymentStrictSend().name)
            // do not sum up the amount that was sent as a fee
            .filter(item => StellarSdk.StrKey.encodeEd25519PublicKey(
                item
                    .tr()
                    .pathPaymentStrictSendResult()
                    .success()
                    .last()
                    .destination()
                    .value(),
            ) !== FEE_ADDRESS);

        const destinationAssetString = Swap.getResultXdrAssetString(
            sendSwapOps[0]
                .tr()
                .pathPaymentStrictSendResult()
                .success()
                .last()
                .asset(),
        );

        return sendSwapOps.reduce((acc, op) => acc.plus(
            op.tr()
                .pathPaymentStrictSendResult()
                .success()
                .offers()
                .reduce((offersAcc, offer) => {
                    const offerValue = offer.value();
                    const asset = offerValue.assetSold();
                    const assetString = Swap.getResultXdrAssetString(asset);

                    if (assetString === destinationAssetString) {
                        return offersAcc.plus(new BigNumber(Number(offerValue.amountSold())));
                    }
                    return offersAcc;
                }, new BigNumber(0)),
        ), new BigNumber(0))
            .times(XDR_AMOUNT_COEFFICIENT)
            .toNumber()
            .toFixed(7);
    }

    /**
     * Get the final amount of the receive-side swap transaction
     * @param txRes: Horizon.SubmitTransactionResponse swap transaction result
     * @return {string} swap source amount
     */
    static getReceiveSwapSourceAmount(txRes) {
        const transactionResult = StellarSdk.xdr.TransactionResult.fromXDR(
            txRes.result_xdr,
            'base64',
        );

        const receiveSwapOps = transactionResult
            .result()
            .results()
            .filter(res => res.value().switch().name === StellarSdk.xdr.OperationType.pathPaymentStrictReceive().name);

        const sourceAssetString = Swap.getResultXdrAssetString(
            receiveSwapOps[0]
                .tr()
                .pathPaymentStrictReceiveResult()
                .success()
                .offers()[0]
                .value()
                .assetBought(),
        );

        let totalAmount = receiveSwapOps.reduce((acc, op) => acc.plus(
            new BigNumber(
                op
                    .tr()
                    .pathPaymentStrictReceiveResult()
                    .success()
                    .offers()
                    .reduce((offersAcc, offer) => {
                        const offerValue = offer.value();
                        const asset = offerValue.assetBought();

                        const assetString = Swap.getResultXdrAssetString(asset);

                        if (assetString === sourceAssetString) {
                            return offersAcc.plus(new BigNumber(Number(offerValue.amountBought())));
                        }
                        return offersAcc;
                    }, new BigNumber(0)),
            ),
        ), new BigNumber(0));


        // sum up the amount that was sent as a fee
        const feeOps = transactionResult
            .result()
            .results()
            .filter(res => res.value().switch().name === StellarSdk.xdr.OperationType.pathPaymentStrictSend().name)
            .filter(item => StellarSdk.StrKey.encodeEd25519PublicKey(
                item
                    .tr()
                    .pathPaymentStrictSendResult()
                    .success()
                    .last()
                    .destination()
                    .value(),
            ) === FEE_ADDRESS);

        // include fee amounts in the total amount
        if (feeOps.length) {
            feeOps.forEach(item => {
                totalAmount = totalAmount.plus(
                    item
                        .tr()
                        .pathPaymentStrictSendResult()
                        .success()
                        .offers()
                        .reduce((offersAcc, offer) => {
                            const offerValue = offer.value();
                            const asset = offerValue.assetBought();

                            const assetString = Swap.getResultXdrAssetString(asset);

                            if (assetString === sourceAssetString) {
                                return offersAcc.plus(new BigNumber(Number(offerValue.amountBought())));
                            }

                            return offersAcc;
                        }, new BigNumber(0)),
                );
            });
        }

        return totalAmount.times(XDR_AMOUNT_COEFFICIENT).toNumber().toFixed(7);
    }

    static getResultXdrAssetString(assetResult) {
        const assetValue = assetResult.value();

        if (!assetValue) {
            return 'native';
        }

        const assetCode = assetValue.assetCode().toString();
        const assetIssuer = StellarSdk.StrKey.encodeEd25519PublicKey(assetValue.issuer().value());

        return `${assetCode}:${assetIssuer}`;
    }
}

