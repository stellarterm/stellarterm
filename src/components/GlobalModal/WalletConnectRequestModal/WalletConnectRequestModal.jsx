import React, { useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';

const TX_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    AWAIT_SIGNERS: 'await_signers',
};

const STATUS_ICONS = {
    [TX_STATUS.PENDING]: 'icon-clock',
    [TX_STATUS.SUCCESS]: '24-icon-success-circle',
    [TX_STATUS.FAILED]: 'icon-circle-fail',
    [TX_STATUS.AWAIT_SIGNERS]: 'icon-clock',
};

const STATUS_TEXT = {
    [TX_STATUS.PENDING]: 'Waiting For Confirmation',
    [TX_STATUS.SUCCESS]: 'Transaction Completed',
    [TX_STATUS.FAILED]: 'Transaction Rejected',
    [TX_STATUS.AWAIT_SIGNERS]: 'Transaction Confirmed. More signatures required to complete',
};

export default function WalletConnectRequestModal(props) {
    const [txState, setTxState] = useState(TX_STATUS.PENDING);

    const { data, submit } = props;

    data.result
        .then(result => {
            if (!result) {
                return;
            }
            if (result.status === 'success') {
                setTxState(TX_STATUS.SUCCESS);
            } else if (result.status === 'pending') {
                setTxState(TX_STATUS.AWAIT_SIGNERS);
            }
        })
        .catch(() => setTxState(TX_STATUS.FAILED));

    return (
        <div className="MultisigSubmitModal WalletConnectRequestModal">
            <div className="Modal_header">
                <span>Transaction</span>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>
            <div className="WalletConnectRequestModal__content">
                <div className="WalletConnectRequestModal__title">
                    View and sign the transaction in {data.title}
                </div>

                <div className="WalletConnectRequestModal__description">
                    The transaction has been sent to {data.title} app for confirmation.
                </div>

                <div className="WalletConnectRequestModal__container">
                    <div className="WalletConnectRequestModal__icons">
                        <img
                            src={images[data.logo] || data.logo}
                            className="WalletConnectRequestModal__logo"
                            alt={data.title}
                        />
                        <img
                            src={images[STATUS_ICONS[txState]]}
                            className="WalletConnectRequestModal__status-icon"
                            alt=""
                        />
                    </div>
                    <div className="WalletConnectRequestModal__status">
                        {STATUS_TEXT[txState]}
                    </div>
                </div>

                <button
                    className={(txState === TX_STATUS.SUCCESS || txState === TX_STATUS.AWAIT_SIGNERS) ?
                        's-button' :
                        'cancel-button'
                    }
                    onClick={() => submit.cancel()}
                >
                    {txState === TX_STATUS.SUCCESS ? 'Done' : 'Close'}
                </button>
            </div>
        </div>
    );
}
WalletConnectRequestModal.propTypes = {
    data: PropTypes.objectOf(PropTypes.any),
    submit: PropTypes.objectOf(PropTypes.func),
};

