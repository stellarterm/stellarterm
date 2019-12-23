import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';

export default function MinMaxAmount(props) {
    const { withdrawFormLabel, isDeposit, assetCode, minLimit, maxLimit } = props;

    if (!minLimit && !maxLimit) { return null; }

    let titleActionText;
    let minMaxAmount;
    let warningText;

    if (!maxLimit && minLimit) {
        titleActionText = 'Minimum';
        warningText = 'insufficient';
        minMaxAmount = minLimit;
    } else if (maxLimit && !minLimit) {
        titleActionText = 'Maximum';
        warningText = 'excessive';
        minMaxAmount = maxLimit;
    }

    const titleText = isDeposit ? 'deposit' : 'withdraw';
    const fullTitleText = `${titleActionText} ${titleText} amount`;

    if (maxLimit && minLimit) {
        warningText = 'insufficient or excessive';

        return withdrawFormLabel ? (
            <div className="input_additional_info">
                <span>{`Minimum: ${minLimit} ${assetCode}. Maximum: ${maxLimit} ${assetCode}`}</span>
            </div>
        ) : (
            <React.Fragment>
                <div className="content_block">
                    <div className="content_title">Minimum deposit amount</div>
                    <div className="content_text">
                        {minLimit} {assetCode}
                    </div>
                </div>
                <div className="content_block">
                    <div className="content_title">Maximum deposit amount</div>
                    <div className="content_text">
                        {maxLimit} {assetCode}
                    </div>
                    <div className="content_text">
                        <img src={images['icon-warning-triangle']} alt="warning" />
                        Be careful! Your funds may be lost if you transfer an {warningText} amount.
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
    minLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    maxLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
