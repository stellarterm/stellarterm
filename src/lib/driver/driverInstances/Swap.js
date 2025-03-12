import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarBrokerClient, Mediator } from '@stellar-broker/client';
import BigNumber from 'bignumber.js';
import { post, get } from '../../api/request';
import { TOP_MARKETS_API } from '../../../env-consts';
import { ENDPOINTS, getEndpoint } from '../../api/endpoints';
import { getAssetString } from './Session';
import { AUTH_TYPE } from '../../constants/sessionConstants';

const XDR_AMOUNT_COEFFICIENT = 0.0000001;
const SMART_ROUTING_MIN_AMOUNT = 20; // 20$
const SMART_ROUTING_FEE = 30; // 30%
const SMART_ROUTING_MAX_PRICE_IMPACT = -0.2;


export const SMART_SWAP_VERSION = {
    DISABLED: 'disabled',
    V1: 'v1',
    V2: 'v2',
};

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

        this.client = null;

        this.timeout = null;

        this.finishPromiseResolver = null;
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


    listenToBestPath({
        source,
        destination,
        amount,
        destinationPriceUSD,
        sourcePriceUSD,
        smartSwapVersion,
        isSend,
        callback,
        errorCallback,
        slippage,
        signCallback,
    }) {
        this.unlistenToBestPath();
        if (smartSwapVersion === SMART_SWAP_VERSION.V2) {
            this.getBestPathV2({
                source,
                destination,
                amount,
                isSend,
                callback,
                errorCallback,
                slippage,
                signCallback,
            });

            return;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.getBestPathV1({
            source,
            destination,
            amount,
            destinationPriceUSD,
            sourcePriceUSD,
            smartSwapVersion,
            isSend,
        }).then(res => {
            callback(res);

            this.timeout = setTimeout(() => this.listenToBestPath({
                source,
                destination,
                amount,
                destinationPriceUSD,
                sourcePriceUSD,
                smartSwapVersion,
                isSend,
                callback,
                errorCallback,
                slippage,
            }), 15000);
        }).catch(e => {
            errorCallback(e);
        });
    }

    unlistenToBestPath() {
        if (this.client) {
            this.client.stop();
            this.client.close();
            this.client = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }


    async submitSwapV2({ isSend, source, destination, sourceAmount, destinationAmount }) {
        let mediator;
        let kp;

        if (this.driver.session.authType !== AUTH_TYPE.LOBSTR_SIGNER_EXTENSION &&
            this.driver.session.authType !== AUTH_TYPE.WALLET_CONNECT &&
            this.driver.multisig.isMultisigEnabled
        ) {
            this.driver.toastService.error('Oops', 'Swap v2 currently not supported with multisig');
            return Promise.reject(new Error('Swap v2 currently not supported with multisig'));
        }

        if (this.driver.session.authType !== AUTH_TYPE.SECRET || this.driver.multisig.isMultisigEnabled) {
            mediator = new Mediator(
                this.driver.session.account.accountId(),
                isSend ? source : destination,
                isSend ? destination : source,
                isSend ? sourceAmount : destinationAmount,
                async transaction => {
                    const result = await this.driver.session.handlers.sign(transaction, true);
                    return result.signedTx;
                },
            );

            const secret = await mediator.init();
            kp = StellarSdk.Keypair.fromSecret(secret);
        }

        const authCb = async tx => {
            if (!mediator) {
                return this.driver.session.handlers.signTxOrAuthWithSecret(tx);
            }


            if (tx.sign) {
                tx.sign(kp);
                return tx;
            }

            return kp.sign(tx);
        };
        this.client.confirmQuote(kp ? kp.publicKey() : this.driver.session.account.accountId(), authCb);

        return new Promise((resolve, reject) => {
            this.finishPromiseResolver = resolve;
            setTimeout(() => reject(), 60 * 1000);
        }).then(result => {
            if (mediator) {
                setTimeout(() => mediator.dispose(), 2000);
            }
            return result;
        }).catch(() => {
            if (mediator) {
                setTimeout(() => mediator.dispose(), 2000);
            }
            this.driver.toastService.error('Swap timed out', 'Your funds will be returned in a few seconds.');
        });
    }

    async getBestPathV2({
        source,
        destination,
        amount,
        isSend,
        callback,
        errorCallback,
        slippage,
    }) {
        if (!this.client) {
            this.client = new StellarBrokerClient({
                partnerKey: '5MkkwmdX3Z3kNaH9exQRxPXnf8pRDzkDoq6HhGbj27WoxXijRMyMFJ37yDPrbtb1vs',
            });


            await this.client.connect();

            this.client.on('quote', ({ quote }) => {
                if (quote.error) {
                    errorCallback(quote.error);
                    return;
                }
                const result = ({
                    isSmartRouting: true,
                    type: isSend ? 'send' : 'receive',
                    extended_paths: [],
                    profit: Number((isSend ?
                        +quote.estimatedBuyingAmount - +quote.directTrade.buying :
                        +quote.estimatedSellingAmount - +quote.directTrade.selling).toFixed(7)),
                    initial_sum: isSend ? +quote.directTrade.buying : +quote.directTrade.selling,
                    optimized_sum: isSend ? +quote.estimatedBuyingAmount : +quote.estimatedSellingAmount,
                    fee_path: null,
                });

                if (callback) {
                    callback(result);
                }
            });

            this.client.on('error', res => {
                if (errorCallback) {
                    errorCallback(res);
                }
            });

            this.client.on('finished', ({ result }) => {
                if (this.finishPromiseResolver) {
                    this.finishPromiseResolver(result);
                    this.finishPromiseResolver = null;
                }
            });
        }

        this.client.quote({
            sellingAsset: getAssetString(source),
            buyingAsset: getAssetString(destination),
            sellingAmount: isSend ? amount : undefined,
            buyingAmount: isSend ? undefined : amount,
            slippageTolerance: slippage,
        });
    }


    getBestPathV1({
        source,
        destination,
        amount,
        destinationPriceUSD,
        sourcePriceUSD,
        smartSwapVersion,
        isSend, // Boolean: true for send, false for receive
    }) {
        const pathsPromise = isSend
            ? this.driver.Server.strictSendPaths(source, amount, [destination]).call()
            : this.driver.Server.strictReceivePaths([source], destination, amount).call();

        return pathsPromise
            .then(({ records }) =>
                // Use appropriate helper function based on the direction
                (isSend
                    ? Swap.findMaxSendPath(records)
                    : Swap.findMinReceivePath(records)),
            )
            .then(result => {
                // Calculate the price impact
                const priceImpact = new BigNumber(result.destination_amount)
                    .times(new BigNumber(destinationPriceUSD))
                    .div(new BigNumber(result.source_amount))
                    .div(new BigNumber(sourcePriceUSD))
                    .minus(1)
                    .times(100)
                    .toNumber();

                // Check if Smart Swap should be used
                const shouldUseSmartSwap = smartSwapVersion === SMART_SWAP_VERSION.V1 &&
                    priceImpact <= SMART_ROUTING_MAX_PRICE_IMPACT &&
                    (Number(result.source_amount) * sourcePriceUSD >= SMART_ROUTING_MIN_AMOUNT);

                if (shouldUseSmartSwap) {
                    return Swap.getSmartRoutingPath(isSend, source, destination, amount);
                }

                // Return the regular path data
                return ({
                    isSmartRouting: false,
                    type: isSend ? 'send' : 'receive',
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
                    initial_sum: isSend ? result.destination_amount : result.source_amount,
                    optimized_sum: isSend ? result.destination_amount : result.source_amount,
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

    async getUsdPrices(source, destination) {
        const body = JSON.stringify({ asset_keys: [getAssetString(source), getAssetString(destination)] });
        const headers = { 'Content-Type': 'application/json' };

        try {
            const response = await post(`${TOP_MARKETS_API}assets/native-prices/`, { headers, body });
            const { results } = response;

            // Helper function to find price for an asset
            const findPrice = asset =>
                results.find(({ asset_code: code, asset_issuer: issuer }) =>
                    code === asset.code && issuer === asset.issuer,
                );

            const sourcePrice = findPrice(source);
            const destPrice = findPrice(destination);

            return [
                this.getUsdPrice(source, sourcePrice),
                this.getUsdPrice(destination, destPrice),
            ];
        } catch (error) {
            console.error('Error fetching prices:', error);
            return [null, null]; // Return null in case of failure
        }
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
     * Get the final amount of the swap transaction (send or receive)
     * @return {string} swap amount
     * @param txRes Horizon.HorizonApi.SubmitTransactionResponse swap transaction result
     * @param isSend boolean, true for send-side swap, false for receive-side swap
     */
    static getSwapAmount(txRes, isSend) {
        const transactionResult = StellarSdk.xdr.TransactionResult.fromXDR(
            txRes.result_xdr,
            'base64',
        );

        // Filter operations based on whether it's a send or receive swap
        const swapOps = transactionResult
            .result()
            .results()
            .filter(item =>
                item.value().switch().name === (isSend
                    ? StellarSdk.xdr.OperationType.pathPaymentStrictSend().name
                    : StellarSdk.xdr.OperationType.pathPaymentStrictReceive().name),
            );

        // Extract the asset string (destination for send, source for receive)
        const swapOp = swapOps[0];
        const assetString = Swap.getResultXdrAssetString(
            isSend
                ? swapOp.tr().pathPaymentStrictSendResult().success().last()
                    .asset()
                : swapOp.tr().pathPaymentStrictReceiveResult().success().offers()[0].value().assetBought(),
        );

        let totalAmount = swapOps.reduce((acc, op) => acc.plus(
            new BigNumber(
                op.tr()[isSend ? 'pathPaymentStrictSendResult' : 'pathPaymentStrictReceiveResult']()
                    .success()
                    .offers()
                    .reduce((offersAcc, offer) => {
                        const offerValue = offer.value();
                        const asset = isSend
                            ? offerValue.assetSold()
                            : offerValue.assetBought();

                        const currentAssetString = Swap.getResultXdrAssetString(asset);

                        if (currentAssetString === assetString) {
                            return offersAcc.plus(new BigNumber(
                                Number(isSend ? offerValue.amountSold() : offerValue.amountBought()),
                            ));
                        }
                        return offersAcc;
                    }, new BigNumber(0)),
            ),
        ), new BigNumber(0));

        if (!isSend) {
            // If receive transaction, sum up the amount that was sent as a fee in the send ops
            const feeOps = transactionResult
                .result()
                .results()
                .filter(item =>
                    item.value().switch().name === StellarSdk.xdr.OperationType.pathPaymentStrictSend().name,
                )
                .filter(item => StellarSdk.StrKey.encodeEd25519PublicKey(
                    item.tr().pathPaymentStrictSendResult().success().last()
                        .destination()
                        .value(),
                ) === FEE_ADDRESS);

            if (feeOps.length) {
                feeOps.forEach(item => {
                    totalAmount = totalAmount.plus(
                        item.tr().pathPaymentStrictSendResult().success().offers()
                            .reduce((offersAcc, offer) => {
                                const offerValue = offer.value();
                                const asset = offerValue.assetBought();
                                const feeAssetString = Swap.getResultXdrAssetString(asset);

                                if (feeAssetString === assetString) {
                                    return offersAcc.plus(new BigNumber(Number(offerValue.amountBought())));
                                }
                                return offersAcc;
                            }, new BigNumber(0)),
                    );
                });
            }
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

