import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import CopyButton from '../../../Common/CopyButton/CopyButton';

const QrCodeContent = ({ uri }) => (
    <div className="WalletConnectNewPairModal_content">
        <div className="WalletConnectNewPairModal_title">
            Scan QR code with a WalletConnect-compatible wallet
        </div>
        <div className="WalletConnectNewPairModal_description">
            Open your WalletConnect-compatible app with Stellar support, like LOBSTR wallet, and scan the
            QR code to connect.
        </div>
        <a
            className="WalletConnectNewPairModal_link"
            href="https://stellarterm.zendesk.com/hc/en-us/articles/4406496403217"
            target="_blank"
            rel="nofollow noopener noreferrer"
        >
            How do I log in with WalletConnect?
        </a>

        <div className="WalletConnectNewPairModal_qr">
            <QRCode value={uri} size={206} renderAs="svg" />

            <div className="WalletConnectNewPairModal_copy">
                <CopyButton text={uri} />
            </div>
        </div>
    </div>
);
QrCodeContent.propTypes = {
    uri: PropTypes.string.isRequired,
};

export default QrCodeContent;
