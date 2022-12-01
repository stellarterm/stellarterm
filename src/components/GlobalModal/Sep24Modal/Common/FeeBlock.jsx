import React from 'react';
import PropTypes from 'prop-types';
import Printify from '../../../../lib/helpers/Printify';

export default function FeeBlock(props) {
    const { feeFixed, feePercent, assetCode, assetAnchor, amountForFee, isDeposit } = props;
    const withoutFee = feeFixed === 0 && feePercent === 0;

    if (withoutFee) {
        return null;
    }

    const isfixedFee = feeFixed !== 0 && feePercent === 0;
    const isPercentFee = feeFixed === 0 && feePercent !== 0;
    const isBothFee = feeFixed !== 0 && feePercent !== 0;

    const assetName = isDeposit ? (assetAnchor || assetCode) : assetCode;

    const amountProvided = amountForFee !== undefined;
    let feeText;
    let totalFee = 0;

    if (isfixedFee) {
        feeText = `${feeFixed} ${assetName}`;
        totalFee = `${feeFixed} ${assetName}`;
    } else if (isPercentFee) {
        feeText = `${feePercent}%`;
        totalFee = amountProvided ? (
            <div>
                {Printify.lightenZeros(((parseFloat(amountForFee) / 100) * feePercent).toFixed(7))}{' '}
                {assetName}
            </div>
        ) : (
            feeText
        );
    } else if (isBothFee) {
        feeText = `${feeFixed} ${assetName} + ${feePercent}%`;
        totalFee = amountProvided ? (
            <div>
                {Printify.lightenZeros((((parseFloat(amountForFee) / 100) * feePercent) + feeFixed).toFixed(7))}{' '}
                {assetName}
            </div>
        ) : (
            feeText
        );
    }

    const feeTitle = isDeposit ? 'Deposit' : 'Withdrawal';

    return !amountProvided ? (
        <div className="content_block">
            <div className="content_title">{feeTitle} fee</div>
            <div className="content_text">{feeText}</div>
        </div>
    ) : (
        <React.Fragment>
            <div className="content_block">
                <div className="content_title">{feeTitle} fee</div>
                <div className="content_text">{feeText}</div>
            </div>
            {isfixedFee ? null : (
                <div className="content_block">
                    <div className="content_title">Total {feeTitle} fee</div>
                    <div className="content_text">{totalFee}</div>
                </div>
            )}
        </React.Fragment>
    );
}

FeeBlock.propTypes = {
    feeFixed: PropTypes.number.isRequired,
    feePercent: PropTypes.number.isRequired,
    assetCode: PropTypes.string.isRequired,
    assetAnchor: PropTypes.string,
    amountForFee: PropTypes.number,
    isDeposit: PropTypes.bool,
};
