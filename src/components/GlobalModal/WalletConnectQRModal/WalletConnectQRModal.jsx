import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import images from '../../../images';
import CopyButton from '../../Common/CopyButton/CopyButton';


const WalletConnectQRModal = ({ submit, uri }) => (
    <div className="WalletConnectQRModal">
        <div className="Modal_header">
            <span>Log in with WalletConnect</span>
            <img
                src={images['icon-close']}
                alt="X"
                onClick={() => {
                    submit.cancel();
                }}
            />
        </div>
        <div className="WalletConnectQRModal_content">
            <div className="WalletConnectQRModal_title">
                Scan QR code with a WalletConnect-compatible wallet
            </div>
            <div className="WalletConnectQRModal_description">
                Open your WalletConnect-compatible app with Stellar support, like LOBSTR wallet, and scan the
                 QR code to connect.
            </div>
            <a
                className="WalletConnectQRModal_link"
                href="https://stellarterm.freshdesk.com/support/solutions/articles/151000012438-walletconnect-how-do-i-log-in-to-stellarterm-with-my-wallet-app"
                target="_blank"
                rel="nofollow noopener noreferrer"
            >
                How do I log in with WalletConnect?
            </a>

            <div className="WalletConnectQRModal_qr">
                <QRCode value={uri} size={206} renderAs="svg" />

                <div className="WalletConnectQRModal_copy">
                    <CopyButton text={uri} />
                </div>
            </div>
        </div>
    </div>
);

export default WalletConnectQRModal;

WalletConnectQRModal.propTypes = {
    uri: PropTypes.string.isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
};
