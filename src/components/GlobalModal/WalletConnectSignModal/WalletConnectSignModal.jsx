import React, { useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';

export default function WalletConnectSignModal(props) {
    const [txState, setTxState] = useState('loading');

    const { data, submit } = props;

    data.result
        .then(() => {
            setTxState('submitted');
        })
        .catch(() => setTxState('rejected'));

    return (
        <div className="MultisigSubmitModal WalletConnectSignModal">
            <div className="MultisigSubmitModal__header">
                Sign transaction with {data.title}
            </div>
            <div className="MultisigSubmitModal__content">
                <img
                    src={images[data.logo] || data.logo}
                    className="MultisigSubmitModal__logo"
                    alt={data.title}
                />
                <span>Transaction has been sent to {data.title}</span>
            </div>

            <div className="WalletConnectSignModal__state">
                {txState === 'loading' && (
                    <div className="WalletConnectSignModal__result">
                        <span>Status: </span>
                        <span>Pending<Ellipsis /></span>
                    </div>
                )}
                {txState === 'submitted' && (
                    <div className="WalletConnectSignModal__result">
                        <span>Status: </span>
                        <span>Submitted</span>
                    </div>
                )}
                {txState === 'rejected' && (
                    <div className="WalletConnectSignModal__result">
                        <span>Status: </span>
                        <span>Cancelled</span>
                    </div>
                )}

                <button className="MultisigSubmitModal__button" onClick={() => submit.cancel()}>
                    {txState === 'loading' ? 'Close' : 'Ok'}
                </button>
            </div>
        </div>
    );
}
WalletConnectSignModal.propTypes = {
    data: PropTypes.objectOf(PropTypes.string),
    submit: PropTypes.objectOf(PropTypes.func),
};

