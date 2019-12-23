import React from 'react';
import PropTypes from 'prop-types';
import Printify from '../../../../lib/Printify';

export default function FeeBlock(props) {
    const { feeFixed, feePercent, assetCode, amountForFee } = props;
    const isNoFee = feeFixed === 0 && feePercent === 0;
    const isfixedFee = feeFixed !== 0 && feePercent === 0;
    const isPercentFee = feeFixed === 0 && feePercent !== 0;
    const isBothFee = feeFixed !== 0 && feePercent !== 0;

    const amountProvided = amountForFee !== undefined;
    let feeText;
    let totalFee = 0;

    if (isNoFee) {
        feeText = 'No fee';
    } else if (isfixedFee) {
        feeText = `${feeFixed} ${assetCode}`;
        totalFee = `${feeFixed} ${assetCode}`;
    } else if (isPercentFee) {
        feeText = `${feePercent}%`;
        totalFee = amountProvided ? (
            <div>
                {Printify.lightenZeros(((parseFloat(amountForFee) / 100) * feePercent).toFixed(7))}{' '}
                {assetCode}
            </div>
        ) : (
            feeText
        );
    } else if (isBothFee) {
        feeText = `${feeFixed} ${assetCode} + ${feePercent}%`;
        totalFee = amountProvided ? (
            <div>
                {Printify.lightenZeros((((parseFloat(amountForFee) / 100) * feePercent) + feeFixed).toFixed(7))}{' '}
                {assetCode}
            </div>
        ) : (
            feeText
        );
    }

    return !amountProvided ? (
        <div className="content_block">
            <div className="content_title">Fee</div>
            <div className="content_text">{feeText}</div>
        </div>
    ) : (
        <React.Fragment>
            <div className="content_block">
                <div className="content_title">Fee</div>
                <div className="content_text">{feeText}</div>
            </div>
            {isfixedFee || isNoFee ? null : (
                <div className="content_block">
                    <div className="content_title">Total fee</div>
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
    amountForFee: PropTypes.number,
};
