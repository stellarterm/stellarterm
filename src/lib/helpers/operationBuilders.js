import BigNumber from 'bignumber.js';
import * as StellarSdk from 'stellar-sdk';
import { AUTH_TYPE } from '../constants/sessionConstants';

// opts.baseBuying -- StellarSdk.Asset (example: XLM)
// opts.counterSelling -- StellarSdk.Asset (example: USD)
// opts.price -- Exchange ratio selling/buying
// opts.amount -- Here, it's relative to the base (JS-sdk does: Total amount selling)
// opts.type -- String of either 'buy' or 'sell' (relative to base currency)
// opts.offerId - for edit existing offer
export function buildOpCreateBuyOffer(opts, authType) {
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
    if (authType === AUTH_TYPE.LEDGER || authType === AUTH_TYPE.TREZOR) {
        const operationOpts = {
            buying: sdkBuying,
            selling: sdkSelling,
            amount: new BigNumber(bigOptsAmount).times(bigOptsPrice).toFixed(7),
            price: new BigNumber(1).dividedBy(bigOptsPrice),
            offerId,
        };
        return StellarSdk.Operation.manageSellOffer(operationOpts);
    }

    const operationOpts = {
        buying: sdkBuying,
        selling: sdkSelling,
        buyAmount: String(sdkAmount),
        price: String(sdkPrice),
        offerId,
    };

    return StellarSdk.Operation.manageBuyOffer(operationOpts);
}

export function buildOpCreateSellOffer(opts) {
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

    return StellarSdk.Operation.manageSellOffer(operationOpts);
}

export function buildOpSendPayment(opts) {
    return StellarSdk.Operation.payment({
        destination: opts.destination,
        asset: opts.asset,
        amount: opts.amount,
        withMuxing: Boolean(opts.withMuxing),
    });
}

export function buildOpCreateAccount(opts) {
    return StellarSdk.Operation.createAccount({
        destination: opts.destination,
        startingBalance: opts.amount,
    });
}

export function buildOpSetOptions(opts) {
    const options = Array.isArray(opts) ? opts : [opts];

    return options.map(option => StellarSdk.Operation.setOptions(option));
}
export function buildOpChangeTrust(opts) {
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

    return StellarSdk.Operation.changeTrust(operationOpts);
}

export function buildOpClaimClaimableBalance(id) {
    return StellarSdk.Operation.claimClaimableBalance({ balanceId: id });
}

export function buildOpBumpSequence(sequence, id) {
    return StellarSdk.Operation.bumpSequence({
        bumpTo: sequence,
        source: id,
    });
}

export function buildOpRemoveOffer(opts) {
    const offers = Array.isArray(opts) ? opts : [opts];
    function parseAsset(asset) {
        return asset.asset_type === 'native'
            ? StellarSdk.Asset.native()
            : new StellarSdk.Asset(asset.asset_code, asset.asset_issuer);
    }

    return offers.map(offer => {
        const options = {
            buying: parseAsset(offer.buying),
            selling: parseAsset(offer.selling),
            amount: offer.isBuyOffer ? undefined : '0',
            buyAmount: offer.isBuyOffer ? '0' : undefined,
            price: offer.price,
            offerId: offer.id,
        };
        return offer.isBuyOffer ?
            StellarSdk.Operation.manageBuyOffer(options) :
            StellarSdk.Operation.manageSellOffer(options);
    });
}

export function buildOpPathPaymentStrictSend(opts) {
    return StellarSdk.Operation.pathPaymentStrictSend({
        sendAsset: opts.source,
        sendAmount: opts.sourceAmount,
        path: opts.path,
        destAsset: opts.destination,
        destMin: opts.optimizedEstimatedValue,
        destination: opts.address,
    });
}

export function buildOpPathPaymentStrictReceive(opts) {
    return StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: opts.source,
        sendMax: opts.optimizedEstimatedValue,
        path: opts.path,
        destAsset: opts.destination,
        destAmount: opts.destinationAmount,
        destination: opts.address,
    });
}
