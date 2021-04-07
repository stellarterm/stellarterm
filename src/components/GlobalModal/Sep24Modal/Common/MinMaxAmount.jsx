import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';

export default function MinMaxAmount(props) {
    const { isDeposit, assetCode, assetAnchor, minLimit, maxLimit } = props;

    if (!minLimit && !maxLimit) { return null; }

    const titleText = isDeposit ? 'deposit' : 'withdrawal';
    const assetName = isDeposit ? (assetAnchor || assetCode) : assetCode;

    return (
        <React.Fragment>
            {minLimit &&
                <div className="content_block">
                    <div className="content_title">Minimum {titleText} amount</div>
                    <div className="content_text">
                        {minLimit} {assetName}
                    </div>
                </div>
            }

            {maxLimit &&
                <div className="content_block">
                    <div className="content_title">Maximum {titleText} amount</div>
                    <div className="content_text">
                        {maxLimit} {assetName}
                    </div>
                </div>
            }

            <div className="content_block">
                <div className="content_text">
                    <img src={images['icon-warning-triangle']} alt="warning" />
                    <span>
                        {
                            `Be careful! Your funds may be lost if you transfer an
                        ${minLimit ? 'insufficient' : ''}
                        ${minLimit && maxLimit ? ' or ' : ''}
                        ${maxLimit ? 'excessive' : ''}
                        amount.`
                        }
                    </span>
                </div>
            </div>
        </React.Fragment>
    );
}

MinMaxAmount.propTypes = {
    isDeposit: PropTypes.bool,
    assetCode: PropTypes.string.isRequired,
    assetAnchor: PropTypes.string,
    minLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    maxLimit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};
