import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Printify from '../../../../lib/helpers/Printify';

const FeeBlock = ({ feeFixed, feePercent, assetCode, amountForFee }) => {
    const feeDescription = useMemo(() =>
        `${Number(feeFixed) ? `${feeFixed} ${assetCode}` : ''} ${(Number(feeFixed) && Number(feePercent)) ? ' + ' : ''} ${Number(feePercent) ? `${feePercent}%` : ''}`,
    [feeFixed, feePercent, assetCode],
    );

    const feeValue = useMemo(() => {
        if (!feeFixed && !feePercent) {
            return 0;
        }
        let fee = 0;

        if (feeFixed) {
            fee += Number(feeFixed);
        }

        if (feePercent && Boolean(amountForFee)) {
            fee += ((Number(amountForFee) * Number(feePercent)) / 100);
        }
        return fee;
    }, [feeFixed, feePercent, amountForFee]);

    if (!feeValue) {
        return null;
    }

    if (!amountForFee) {
        return (
            <div className="content_block">
                <div className="content_title">Fees</div>
                <div className="content_text">{feeDescription}</div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="content_block">
                <div className="content_title">Fees</div>
                <div className="content_text">{Printify.lightenZeros(feeValue.toFixed(7), undefined, ` ${assetCode}`)}</div>
            </div>
            <div className="content_block">
                <div className="content_title">Amount you receive</div>
                <div className="content_text ">
                    <span className="bold">{Printify.lightenZeros((Number(amountForFee) - feeValue).toFixed(7), undefined, ` ${assetCode}`)}</span>
                </div>
            </div>
        </React.Fragment>
    );
};

FeeBlock.propTypes = {
    feeFixed: PropTypes.number.isRequired,
    feePercent: PropTypes.number.isRequired,
    assetCode: PropTypes.string.isRequired,
    amountForFee: PropTypes.number,
};

export default FeeBlock;
