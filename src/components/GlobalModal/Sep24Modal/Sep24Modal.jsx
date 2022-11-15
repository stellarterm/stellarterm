import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/driver/Driver';
import Sep24ModalContent from './Sep24ModalContent/Sep24ModalContent';
import WithdrawCompleted from './WithdrawCompleted/WithdrawCompleted';

export default function Sep24Modal(props) {
    const { data, d } = props;
    const {
        isDeposit, withdrawCompleted, asset, amount, transaction, noActionBtn, jwtToken, transferServer,
    } = data;

    const titleText = withdrawCompleted ?
        'Withdrawal initiated' :
        `${isDeposit ? 'Deposit' : 'Withdraw'} ${asset.code} asset`;

    return (
        <div className="Sep24Modal">
            <div className="Modal_header">
                <span>{titleText}</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        d.modal.handlers.cancel();
                        window.history.pushState({}, null, '/');
                    }}
                />
            </div>

            <div className="Sep24Modal_content">
                {withdrawCompleted ? (
                    <WithdrawCompleted
                        d={d}
                        asset={asset}
                        transferServer={transferServer}
                        withdrawAmount={amount}
                        transaction={transaction}
                    />
                ) : (
                    <Sep24ModalContent
                        d={d}
                        transferServer={transferServer}
                        isDeposit={isDeposit}
                        asset={asset}
                        noActionBtn={noActionBtn}
                        transaction={transaction || null}
                        jwtToken={jwtToken || null}
                    />
                )}
            </div>
        </div>
    );
}

Sep24Modal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    data: PropTypes.objectOf(PropTypes.any),
};
