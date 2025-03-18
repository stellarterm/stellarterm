/* eslint-disable camelcase */
import React, { useCallback, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Asset } from '@stellar/stellar-sdk';
import PropTypes from 'prop-types';
import images from '../../../../images';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import AppPopover from '../../../Common/AppPopover/AppPopover';
import { getSlippageValue, getSmartSwapVersionValue } from '../SwapSettings/SwapSettings';
import Swap, { FEE_ADDRESS, SMART_SWAP_VERSION } from '../../../../lib/driver/driverInstances/Swap';
import { formatNumber } from '../../../../lib/helpers/Format';
import Driver from '../../../../lib/driver/Driver';
import { AUTH_TYPE, TX_STATUS } from '../../../../lib/constants/sessionConstants';
import ErrorHandler from '../../../../lib/helpers/ErrorHandler';

const SLIPPAGE_WARNING_THRESHOLD = 5; // > 5%

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
        smartSwapVersion,
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

        if (smartSwapVersion === SMART_SWAP_VERSION.V2) {
            d.swap.submitSwapV2({
                isSend,
                source,
                destination,
                sourceAmount,
                destinationAmount,
                withTrust,
            }).then(result => {
                setPending(false);
                submit.finish();
                if (!result && Number(result.sold) === 0) {
                    d.toastService.error('Swap failed', 'Something went wrong');
                    return;
                }
                d.modal.handlers.activate('SwapSuccess', {
                    source,
                    destination,
                    hash: null,
                    sourceAmount: result.sold,
                    destinationAmount: result.bought,
                });
            }).catch(e => {
                setPending(false);
                submit.finish();
                d.toastService.error('Swap error', e.message);
            });
            return;
        }


        const signAndSubmit = await d.session.handlers.swap({
            path,
            withTrust,
            destination,
            source,
            slippage,
            feeAddress: FEE_ADDRESS,
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

            const swapAmount = Swap.getSwapAmount(serverResult, isSend);

            d.modal.handlers.activate('SwapSuccess', {
                source,
                destination,
                hash: serverResult.id,
                sourceAmount: isSend ? sourceAmount : swapAmount,
                destinationAmount: isSend ? swapAmount : destinationAmount,
            });
        } catch (error) {
            const errorMessage = ErrorHandler(error);
            setPending(false);

            d.toastService.error('Swap error', errorMessage);
        }
    };

    if (!path) {
        submit.close();
        return null;
    }

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

                <div
                    className={`SwapConfirm_details-row ${Number(slippage) >= SLIPPAGE_WARNING_THRESHOLD ? 'red' : ''}`}
                >
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

                    <span>{formatNumber(slippage)}%</span>
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

                {path.isSmartRouting ? (
                    <div className="SwapConfirm_details-row">
                        <div className="SwapConfirm_detail-label">
                            <span>Saving</span>
                            <AppPopover
                                content={<div className="SwapConfirm_saving-popover">
                                    <h5>Smart Swap</h5>
                                    <br />
                                    <p>
                                        Smart Routing is the process of
                                        automatically finding the best rate by
                                        splitting your order between different
                                        pools and markets
                                    </p>
                                    {path.extended_paths.map(item =>
                                        <div className="SwapConfirm_saving-popover-row" key={item.readablePath.join()}>
                                            <span>{item.percent.toFixed(2)} %</span>

                                            <div className="SwapConfirm_saving-popover-path">
                                                {item.readablePath.map((code, index) => (
                                                    <React.Fragment key={code}>
                                                        <span>{code}</span>
                                                        {index !== (item.readablePath.length - 1) &&
                                                            <img src={images['icon-arrow-right']} alt="" />}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>,
                                    )}
                                </div>
                                }
                                hoverArea={<img
                                    src={images['icon-info-gray']}
                                    alt="i"
                                />}
                            />
                        </div>

                        <div className="SwapConfirm_saving">
                            ~ {path.profit} {path.type === 'send' ? destination.code : source.code}
                        </div>
                    </div>
                ) : (
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
                            {path.extended_paths[0].readablePath.map((code, index) =>
                                // eslint-disable-next-line react/no-array-index-key
                                <div key={code + index} className="SwapConfirm_path">
                                    <span>{code}</span>
                                    {index !== (path.extended_paths[0].readablePath.length - 1) &&
                                        <img src={images['icon-arrow-right']} alt="" />}
                                </div>,
                            )}
                        </div>
                    </div>
                )}

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
                    <span
                        className="SwapConfirm_info-amount"
                    > {formatNumber(optimizedEstimatedValue)} {isSend ? destination.code : source.code} </span>
                    or the transaction will revert.
                </div>

                {d.session.authType !== AUTH_TYPE.SECRET &&
                    getSmartSwapVersionValue() === SMART_SWAP_VERSION.V2 &&
                    <div className="SwapConfirm_description">
                        You’re using Stellar Broker as your swap engine.
                         The funds to be exchanged will be moved to a dedicated mediator account on the
                         Stellar network that you can access. Once the swap completes, the resulting
                         assets return to your main account. If the swap fails or is interrupted, any unswapped
                         funds are automatically refunded. By clicking ‘Confirm Swap,’ you
                         agree to proceed under these conditions.
                    </div>
                }

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
