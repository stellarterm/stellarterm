import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Driver from '../../../../lib/Driver';
import Sep24ModalFooter from '../Common/Sep24ModalFooter/Sep24ModalFooter';

export default function WithdrawCompleted(props) {
    const { d, asset, withdrawAmount, transaction } = props;

    return (
        <React.Fragment>
            <div className="withdraw_completed_block">
                <img src={images['icon-big-circle-success']} alt="success" />
                <div className="withdrawed_amount">
                    {withdrawAmount} {asset.code}
                </div>
                <div className="withdraw_text">
                    Funds have been sent to anchor for withdrawal process. <br />
                    Please allow some time for a transaction to be processed.
                </div>
            </div>

            <Sep24ModalFooter
                d={d}
                asset={asset}
                isDeposit={false}
                isAnyError={false}
                isLoading={false}
                transaction={transaction}
                withdrawCompleted />
        </React.Fragment>
    );
}

WithdrawCompleted.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    withdrawAmount: PropTypes.string.isRequired,
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
    transaction: PropTypes.objectOf(PropTypes.any).isRequired,
};
