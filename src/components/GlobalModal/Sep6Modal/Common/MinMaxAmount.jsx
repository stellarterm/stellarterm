import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';

export default function MinMaxAmount(props) {
    const { withdrawFormLabel, isDeposit, assetCode, min, max } = props;
    const noAnyLimit = min === '' && max === '';
    const bothLimits = min !== '' && max !== '';
    const onlyMinLimit = min !== '' && max === '';
    const onlyMaxLimit = max !== '' && min === '';

    if (noAnyLimit) { return null; }

    let titleActionText;
    let minMaxAmount;
    let warningText;

    if (onlyMinLimit) {
        titleActionText = 'Minimum';
        warningText = 'insufficient';
        minMaxAmount = min;
    } else if (onlyMaxLimit) {
        titleActionText = 'Maximum';
        warningText = 'excessive';
        minMaxAmount = max;
    }

    const titleText = isDeposit ? 'deposit' : 'withdraw';
    const fullTitleText = `${titleActionText} ${titleText} amount`;

    if (bothLimits) {
        warningText = 'insufficient or excessive';

        return withdrawFormLabel ? (
            <div className="input_additional_info">
                <span>{`Minimum: ${min} ${assetCode}. Maximum: ${max} ${assetCode}`}</span>
            </div>
        ) : (
            <React.Fragment>
                <div className="content_block">
                    <div className="content_title">Minimum deposit amount</div>
                    <div className="content_text">
                        {min} {assetCode}
                    </div>
                    <div className="content_text">
                        <img src={images['icon-warning-triangle']} alt="warning" />
                        Be careful! Your funds may be lost if you transfer an {warningText} amount.
                    </div>
                </div>
                <div className="content_block">
                    <div className="content_title">Maximum deposit amount</div>
                    <div className="content_text">
                        {max} {assetCode}
                    </div>
                </div>
            </React.Fragment>
        );
    }

    return withdrawFormLabel ? (
        <div className="input_additional_info">
            <span>{`${titleActionText}: ${minMaxAmount} ${assetCode}`}</span>
        </div>
    ) : (
        <div className="content_block">
            <div className="content_title">{fullTitleText}</div>
            <div className="content_text">
                {minMaxAmount} {assetCode}
            </div>
            <div className="content_text">
                <img src={images['icon-warning-triangle']} alt="warning" />
                Be careful! Your funds may be lost if you transfer an {warningText} amount.
            </div>
        </div>
    );
}

MinMaxAmount.propTypes = {
    isDeposit: PropTypes.bool,
    withdrawFormLabel: PropTypes.bool,
    assetCode: PropTypes.string.isRequired,
    min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
