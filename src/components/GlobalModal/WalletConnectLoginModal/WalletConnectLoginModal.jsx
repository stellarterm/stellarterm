import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import QRCode from 'qrcode.react';
import CopyButton from '../../Common/CopyButton/CopyButton';


const WalletConnectLoginModal = ({ submit, uri }) => (
    <div className="WalletConnectLoginModal">
        <div className="Modal_header">
            <span>Scan QR-code with a WalletConnect-compatible wallet</span>
            <img
                src={images['icon-close']}
                alt="X"
                onClick={() => {
                    submit.cancel();
                }}
            />
        </div>
        <div className="WalletConnectLoginModal_content">
            <QRCode value={uri} size={500} renderAs="svg" />

            <div className="WalletConnectLoginModal_copy">
                <CopyButton text={uri} />
            </div>
        </div>
    </div>
);

export default WalletConnectLoginModal;

WalletConnectLoginModal.propTypes = {
    uri: PropTypes.string.isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
};
