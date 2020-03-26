import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/Driver';
import Sep24ModalContent from './Sep24ModalContent/Sep24ModalContent';
import WithdrawCompleted from './WithdrawCompleted/WithdrawCompleted';

export default function Sep24Modal(props) {
    const { isDeposit, withdrawCompleted } = props.data;
    const { data, d } = props;

    const titleText = withdrawCompleted ?
        'Withdrawal initiated' :
        `${isDeposit ? 'Deposit' : 'Withdraw'} ${data.asset.code} asset`;

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
                    }} />
            </div>

            <div className="Sep24Modal_content">
                {withdrawCompleted ? (
                    <WithdrawCompleted
                        d={d}
                        asset={data.asset}
                        withdrawAmount={data.amount}
                        transaction={data.transaction} />
                ) : (
                    <Sep24ModalContent
                        d={d}
                        isDeposit={isDeposit}
                        asset={data.asset}
                        noActionBtn={data.noActionBtn}
                        transaction={data.transaction || null}
                        jwtToken={data.jwtToken || null} />
                )}
            </div>
        </div>
    );
}

Sep24Modal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    data: PropTypes.objectOf(PropTypes.any),
};
