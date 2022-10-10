/* eslint-disable camelcase */
import React, { useCallback, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import StellarSdk, { Asset } from 'stellar-sdk';
import PropTypes from 'prop-types';
import images from '../../../../images';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import AppPopover from '../../../Common/AppPopover/AppPopover';
import Driver from '../../../../lib/Driver';
import { formatNumber } from '../../../../lib/Format';
import { getSlippageValue } from '../SwapSettings/SwapSettings';
import ErrorHandler from '../../../../lib/ErrorHandler';
import { AUTH_TYPE, TX_STATUS } from '../../../../lib/constants';
import Swap from '../../../../lib/driver/Swap';


const processPathAsset = ({ asset_type, asset_code, asset_issuer }) => {
    if (asset_type === 'native') {
        return StellarSdk.Asset.native();
    }

    return new StellarSdk.Asset(asset_code, asset_issuer);
};

const SwapConfirm = ({ params, submit, d }) => {
    const [isPriceReverted, setIsPriceReverted] = useState(false);
    const [pending, setPending] = useState(false);

    const {
        source,
        sourceAmount,
        sourceAmountUSD,
        destination,
        destinationAmount,
        destinationAmountUSD,
        path,
        priceImpact,
        isSend,
    } = params;

    const slippage = Number(getSlippageValue());

    const optimizedEstimatedValue = isSend ?
        new BigNumber(destinationAmount).times(100 - slippage).div(100).toFixed(7) :
        new BigNumber(sourceAmount).times(100 + slippage).div(100).toFixed(7);


    const [initialPrice, setInitialPrice] =
        useState(new BigNumber(sourceAmount).div(new BigNumber(destinationAmount)).toFixed(7));

    const [initialPriceReverted, setInitialPriceReverted] =
        useState(new BigNumber(destinationAmount).div(new BigNumber(sourceAmount)).toFixed(7));

    const currentPrice = useMemo(() =>
        new BigNumber(sourceAmount)
            .div(new BigNumber(destinationAmount))
            .toFixed(7),
    [sourceAmount, destinationAmount]);

    const currentPriceReverted = useMemo(() =>
        new BigNumber(destinationAmount)
            .div(new BigNumber(sourceAmount))
            .toFixed(7),
    [sourceAmount, destinationAmount]);

    const priceHasChanges = useMemo(() => currentPrice !== initialPrice ||
        currentPriceReverted !== initialPriceReverted,
    [currentPrice, currentPriceReverted, initialPrice, initialPriceReverted],
    );

    const priceImpactRounded = (priceImpact !== null && priceImpact !== undefined) ?
        Number(priceImpact.toFixed(1)) :
        null;

    const priceImpactClassname = `${priceImpactRounded > 0 ? 'positive' : ''}${priceImpactRounded < 0 ? 'negative' : ''}`;

    const price = useMemo(() => {
        if (!sourceAmount || !destinationAmount || !destination) {
            return null;
        }

        const priceValue = isPriceReverted ?
            new BigNumber(sourceAmount).div(new BigNumber(destinationAmount)).toFixed(7) :
            new BigNumber(destinationAmount).div(new BigNumber(sourceAmount)).toFixed(7);

        return isPriceReverted ?
            `1 ${destination.code} = ${formatNumber(priceValue)} ${source.code}` :
            `1 ${source.code} = ${formatNumber(priceValue)} ${destination.code}`;
    }, [sourceAmount, destinationAmount, isPriceReverted, source, destination]);


    const processedPath = useMemo(() => path.path.map(asset => processPathAsset(asset)), [path]);

    const fullPath = useMemo(() =>
        [source, ...processedPath, destination],
    [source, destination, processedPath],
    );

    const togglePrice = () => {
        setIsPriceReverted(prevState => !prevState);
    };

    const submitChanges = useCallback(() => {
        setInitialPrice(currentPrice);
        setInitialPriceReverted(currentPriceReverted);
    }, [currentPrice, currentPriceReverted]);

    const submitSwap = async () => {
        if (pending) { return; }

        setPending(true);

        const withTrust = d.session.account.getBalance(destination) === null;

        if (d.session.authType === AUTH_TYPE.LEDGER) {
            submit.finish();
        }

        const signAndSubmit = await d.session.handlers.swap({
            isSend,
            source,
            sourceAmount,
            destination,
            destinationAmount,
            optimizedEstimatedValue,
            withTrust,
            path: processedPath,
        });

        if (signAndSubmit.status === TX_STATUS.SENT_TO_WALLET_CONNECT) {
            return;
        }

        if (signAndSubmit.status === TX_STATUS.AWAIT_SIGNERS) {
            submit.finish();
            return;
        }

        try {
            const serverResult = await signAndSubmit.serverResult;
            submit.finish();

            d.modal.handlers.activate('SwapSuccess', {
                source,
                destination,
                hash: serverResult.id,
                sourceAmount: isSend ? sourceAmount : Swap.getReceivePathPaymentSourceAmount(serverResult),
                destinationAmount: isSend ? Swap.getSendPathPaymentDestAmount(serverResult) : destinationAmount,
            });
        } catch (error) {
            const errorMessage = ErrorHandler(error);
            setPending(false);

            d.toastService.error('Swap error', errorMessage);
        }
    };

    return (
        <div className="SwapConfirm">
            <div className="Modal_header">
                <span>Confirm swap</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>
            <div className="SwapConfirm_content">
                <div className="SwapConfirm_assets">
                    <div className="SwapConfirm_asset">
                        <AssetCardSeparateLogo
                            d={d}
                            code={source.code}
                            issuer={source.issuer}
                            circle
                            logoSize={26}
                            noIssuer
                        />
                        <div className="SwapConfirm_amounts">
                            {sourceAmountUSD && <div className="SwapConfirm_equivalent">
                                ~ ${formatNumber(sourceAmountUSD.toFixed(2))}
                            </div>}
                            <div className="SwapConfirm_amount">
                                {formatNumber(sourceAmount)} {source.code}
                            </div>
                        </div>
                    </div>
                    <img src={images['icon-swap-arrow']} alt="" className="SwapConfirm_arrow" />
                    <div className="SwapConfirm_asset">
                        <AssetCardSeparateLogo
                            d={d}
                            code={destination.code}
                            issuer={destination.issuer}
                            circle
                            logoSize={26}
                            noIssuer
                        />
                        <div className="SwapConfirm_amounts">
                            {destinationAmountUSD && <div className="SwapConfirm_equivalent">
                                ~ ${formatNumber(destinationAmountUSD.toFixed(2))}
                                {priceImpactRounded !== null &&
                                    <span className={priceImpactClassname}>
                                        {' '}({priceImpactRounded > 0 ? '+' : ''}{priceImpactRounded}%)
                                    </span>}
                            </div>}
                            <div className="SwapConfirm_amount">
                                {formatNumber(destinationAmount)} {destination.code}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="SwapConfirm_details-row SwapConfirm_details-row--first">
                    <span>Exchange rate:</span>

                    <div className="SwapConfirm_price" onClick={() => togglePrice()}>
                        {price}
                        <img src={images.switch} alt="" />
                    </div>
                </div>

                <div className="SwapConfirm_details-title">Swap details</div>

                <div className="SwapConfirm_details-row">
                    <div className="SwapConfirm_detail-label">
                        <span>Slippage tolerance</span>
                        <AppPopover
                            content={'Your transaction will revert if the price changes unfavorably by more than this percentage.'}
                            hoverArea={<img
                                src={images['icon-info-gray']}
                                alt="i"
                            />}
                        />
                    </div>

                    <span>{slippage}%</span>
                </div>

                <div className="SwapConfirm_details-row">
                    <div className="SwapConfirm_detail-label">
                        <span>{isSend ? 'Minimum received' : 'Maximum spend'}</span>
                        <AppPopover
                            content={'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed'}
                            hoverArea={<img
                                src={images['icon-info-gray']}
                                alt="i"
                            />}
                        />
                    </div>

                    <span>{formatNumber(optimizedEstimatedValue)} {isSend ? destination.code : source.code}</span>
                </div>

                <div className="SwapConfirm_details-row">
                    <div className="SwapConfirm_detail-label">
                        <span>Path</span>
                        <AppPopover
                            content={'Routing through these assets resulted in the best price for your trade'}
                            hoverArea={<img
                                src={images['icon-info-gray']}
                                alt="i"
                            />}
                        />
                    </div>

                    <div className="SwapConfirm_path">
                        {fullPath.map(({ code, issuer }, index) =>
                            <div key={code + issuer} className="SwapConfirm_path">
                                <span>{code}</span>
                                {index !== (fullPath.length - 1) && <img src={images['icon-arrow-right']} alt="" />}
                            </div>,
                        )}
                    </div>
                </div>

                {(priceHasChanges && !pending) && (
                    <div className="SwapConfirm_alert">
                        <img src={images['icon-info']} alt="i" />
                        <span>Price updated</span>

                        <div className="SwapConfirm_accept-price" onClick={() => submitChanges()}>
                            <img src={images['icon-tick-small']} alt="" />
                            <span>ACCEPT</span>
                        </div>
                    </div>
                )}

                <div className="SwapConfirm_info">
                    Output is estimated. You will {isSend ? 'receive at least' : 'send a maximum of'}
                    <span className="SwapConfirm_info-amount"> {formatNumber(optimizedEstimatedValue)} {isSend ? destination.code : source.code} </span>
                    or the transaction will revert.
                </div>

                <button className="s-button" disabled={priceHasChanges || pending} onClick={() => submitSwap()}>
                    Confirm Swap
                    {pending && <div className="nk-spinner" />}
                </button>

            </div>
        </div>
    );
};

export default SwapConfirm;

SwapConfirm.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    params: PropTypes.shape({
        source: PropTypes.instanceOf(Asset),
        sourceAmount: PropTypes.string,
        sourceAmountUSD: PropTypes.number,
        destination: PropTypes.instanceOf(Asset),
        destinationAmount: PropTypes.string,
        destinationAmountUSD: PropTypes.number,
        path: PropTypes.any,
        priceImpact: PropTypes.number,
        isSend: PropTypes.bool,
    }),
};
