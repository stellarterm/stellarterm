import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Input from '../../../Common/Input/Input';
import InfoBlock from '../../../Common/InfoBlock/InfoBlock';
import Driver from '../../../../lib/driver/Driver';
import { SMART_SWAP_VERSION } from '../../../../lib/driver/driverInstances/Swap';

export const SWAP_SLIPPAGE_LS_ALIAS = 'swap_slippage_value';
export const SWAP_VERSION_LS_ALIAS = 'swap_smart_version';

const DEFAULT_SLIPPAGE = '5';

export const getSlippageValue = () => localStorage.getItem(SWAP_SLIPPAGE_LS_ALIAS) || DEFAULT_SLIPPAGE;
export const setSlippageValue = slippage => {
    localStorage.setItem(SWAP_SLIPPAGE_LS_ALIAS, slippage);
};

export const getSmartSwapVersionValue = () => {
    const stored = localStorage.getItem(SWAP_VERSION_LS_ALIAS);
    return stored && stored !== SMART_SWAP_VERSION.V2
        ? stored
        : SMART_SWAP_VERSION.V1;
};

export const setSmartSwapVersionValue = value => {
    localStorage.setItem(SWAP_VERSION_LS_ALIAS, value);
};

const SWAP_PERCENTS = [0.1, 0.5, 1, 5];

const SwapSettings = ({ submit, d }) => {
    const [slippage, setSlippage] = useState(getSlippageValue());
    const [smartSwapVersion, setSmartSwapVersion] = useState(getSmartSwapVersionValue());

    const onSave = () => {
        setSlippageValue(slippage);
        setSmartSwapVersionValue(smartSwapVersion);
        d.toastService.success('Success', 'You\'ve successfully saved settings');
        d.modal.handlers.finish();
    };

    const errorText = useMemo(() => {
        if (Number.isNaN(Number(slippage)) || Number(slippage) > 50 || Number(slippage) < 0) {
            return 'Invalid slippage value. Enter a valid slippage value.';
        }
        return '';
    }, [slippage]);

    return (
        <div className="Modal SwapSettings">
            <div className="Modal_header">
                <span>Transaction settings</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>

            <div className="SwapSettings-content">
                <div className="SwapSettings-title">
                    Slippage tolerance
                </div>

                <div className="SwapSettings-description">
                    Swap transactions will fail if the price changes unfavorably during processing by more than
                    the tolerance percentage you set. Be aware, a slippage tolerance above 1% can result in
                    unfavorable transactions
                </div>

                <Input
                    placeholder="0.1%"
                    invalid={Boolean(errorText)}
                    errorText={errorText}
                    onChange={setSlippage}
                    value={slippage.toString()}
                    inputType="number"
                    style={{ paddingRight: '200px' }}
                    postfix={
                        <div className="SwapSettings_percents">
                            {SWAP_PERCENTS.map(percent => (
                                <div
                                    key={percent}
                                    className={`SwapSettings_percent ${percent === Number(slippage) ? 'SwapSettings_percent--active' : ''}`}
                                    onClick={() => setSlippage(percent.toString())}
                                >
                                    {percent}%
                                </div>
                            ))}
                        </div>
                    }
                />

                {Boolean(slippage) && Number(slippage) <= 0.1 && Number(slippage) > 0 &&
                    <InfoBlock type={'warning'} withIcon onlyTitle smallInRow title={'Your transaction may fail'} />
                }

                <div className="SwapSettings-title topMargin">
                    Swap Routing Engine
                </div>

                <div className="SwapSettings-switcher">
                    {/* <div */}
                    {/*    className={`SwapSettings-switcher-option ${smartSwapVersion === SMART_SWAP_VERSION.V2 ? 'active' : ''}`} */}
                    {/*    onClick={() => setSmartSwapVersion(SMART_SWAP_VERSION.V2)} */}
                    {/* > */}
                    {/*    Stellar Broker */}
                    {/* </div> */}
                    <div
                        className={`SwapSettings-switcher-option ${smartSwapVersion === SMART_SWAP_VERSION.V1 ? 'active' : ''}`}
                        onClick={() => setSmartSwapVersion(SMART_SWAP_VERSION.V1)}
                    >
                        StellarTerm
                    </div>
                    <div
                        className={`SwapSettings-switcher-option ${smartSwapVersion === SMART_SWAP_VERSION.DISABLED ? 'active' : ''}`}
                        onClick={() => setSmartSwapVersion(SMART_SWAP_VERSION.DISABLED)}
                    >
                        Basic
                    </div>
                </div>

                <div className="SwapSettings-description fixed-height">
                    {smartSwapVersion === SMART_SWAP_VERSION.DISABLED ? 'This option uses the standard Stellar Path Payment operation to find the best rates exclusively on the classic Stellar DEX and the built-in Stellar AMM. No advanced splitting or routing is performed.' : ''}
                    {smartSwapVersion === SMART_SWAP_VERSION.V1 ? 'This option utilizes the classic Stellar DEX and Stellar AMM but splits your total amount into smaller parts. By routing multiple smaller swaps, StellarTerm can optimize rates more effectively than a single path payment. A fee of 30% of the extra savings generated is automatically included in the quote.' : ''}
                    {smartSwapVersion === SMART_SWAP_VERSION.V2 ? 'This is our most advanced swap option, leveraging Stellar Broker to scan both the classic Stellar network (DEX, AMM) and Soroban-based liquidity pools. Stellar Broker aims to secure the best rates across all available sources. Note that both Stellar Broker and StellarTerm each take a 20% fee on any extra savings generated. This fee is already included in your quote.' : ''}
                </div>

                <div className="Modal_button-block">
                    <button
                        className="s-button"
                        disabled={!slippage || Boolean(errorText)}
                        onClick={() => onSave()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SwapSettings;

SwapSettings.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
};
