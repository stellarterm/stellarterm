import React, { useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';


const STATUS_ICONS = {
    Pending: 'icon-clock',
    Success: 'icon-circle-success',
    Failed: 'icon-circle-fail',
};

const STATUS_TEXT = {
    Pending: 'Waiting For Confirmation',
    Success: 'Transaction completed',
    Failed: 'Transaction Rejected',
};

export default function WalletConnectRequestModal(props) {
    const [txState, setTxState] = useState('Pending');

    const { data, submit } = props;

    data.result
        .then(() => {
            setTxState('Success');
        })
        .catch(() => setTxState('Failed'));

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
                    className={txState === 'Success' ? 's-button' : 'cancel-button'}
                    onClick={() => submit.cancel()}
                >
                    {txState === 'Success' ? 'Done' : 'Close'}
                </button>
            </div>
        </div>
    );
}
WalletConnectRequestModal.propTypes = {
    data: PropTypes.objectOf(PropTypes.any),
    submit: PropTypes.objectOf(PropTypes.func),
};

