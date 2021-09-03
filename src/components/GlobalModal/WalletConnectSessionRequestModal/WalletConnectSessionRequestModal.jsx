import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';


const WalletConnectSessionRequestModal = ({ data, submit }) => (
    <div className="MultisigSubmitModal WalletConnectSessionRequestModal">
        <div className="Modal_header">
            <span>Connecting to {data.title} with WalletConnect</span>
            <img
                src={images['icon-close']}
                alt="X"
                onClick={() => {
                    submit.cancel();
                }}
            />
        </div>
        <div className="WalletConnectSessionRequestModal__content">
            <div className="WalletConnectSessionRequestModal__title">
                The connection request was sent to {data.title}.
                <br />
                Confirm the request in the app and continue with StellarTerm.
            </div>
            <div className="WalletConnectSessionRequestModal__container">
                <div className="WalletConnectSessionRequestModal__icons">
                    <img className="WalletConnectSessionRequestModal__icon" src={images['st-logo']} alt="" />
                    <img className="WalletConnectSessionRequestModal__arrows" src={images['icon-arrows']} alt="" />
                    <img className="WalletConnectSessionRequestModal__icon" src={data.logo} alt="" />
                </div>
                <span className="WalletConnectSessionRequestModal__loader">Connecting<Ellipsis /></span>
            </div>
        </div>
    </div>
);
WalletConnectSessionRequestModal.propTypes = {
    data: PropTypes.objectOf(PropTypes.any),
    submit: PropTypes.objectOf(PropTypes.func),
};

export default WalletConnectSessionRequestModal;
