import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Driver from '../../../../lib/Driver';
import Sep6ModalFooter from '../Common/Sep6ModalFooter/Sep6ModalFooter';

export default function WithdrawCompleted(props) {
    const { d, asset, isDeposit, withdrawAmount, transferServer } = props;

    return (
        <React.Fragment>
            <div className="withdraw_completed_block">
                <img src={images['icon-big-circle-success']} alt="success" />
                <div className="withdrawed_amount">
                    {withdrawAmount} {asset.code}
                </div>
                <div style={{ textAlign: 'center' }}>
                    Funds have been sent to anchor for withdrawal process. <br />
                    Please allow some time for a transaction to be processed.
                </div>
            </div>

            <Sep6ModalFooter
                d={d}
                asset={asset}
                isDeposit={isDeposit}
                isAnyError={false}
                isLoading={false}
                transferServer={transferServer}
                withdrawCompleted
            />
        </React.Fragment>
    );
}

WithdrawCompleted.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    isDeposit: PropTypes.bool.isRequired,
    withdrawAmount: PropTypes.string.isRequired,
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])).isRequired,
    transferServer: PropTypes.objectOf(PropTypes.any),
};
