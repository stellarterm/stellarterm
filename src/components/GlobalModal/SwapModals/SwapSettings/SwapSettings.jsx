import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Input from '../../../Common/Input/Input';
import InfoBlock from '../../../Common/InfoBlock/InfoBlock';
import Driver from '../../../../lib/Driver';

export const SWAP_SLIPPAGE_ALIAS = 'swap_slippage_value';

export const getSlippageValue = () => localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1';
export const setSlippageValue = slippage => {
    localStorage.setItem(SWAP_SLIPPAGE_ALIAS, slippage);
};

const SWAP_PERCENTS = [0.1, 0.5, 1];

const SwapSettings = ({ submit, d }) => {
    const [slippage, setSlippage] = useState(getSlippageValue());

    const onSave = () => {
        setSlippageValue(slippage);
        d.toastService.success('Success', 'You\'ve successfully saved settings');
        submit.cancel();
    };

    const errorText = useMemo(() => {
        if (Number.isNaN(Number(slippage)) || Number(slippage) > 50 || Number(slippage) < 0) {
            return 'Invalid slippage value. Enter a valid slippage value.';
        }
        return '';
    }, [slippage]);

    return (
        <div className="SwapSettings">
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
