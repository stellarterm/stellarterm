import React, { useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import QrCodeContent from './QrCodeContent/QrCodeContent';
import DesktopContent from './DesktopContent/DesktopContent';

const TABS = {
    QR: 'qr',
    DESKTOP: 'desktop',
};


const WalletConnectNewPairModal = ({ submit, uri }) => {
    const [currentTab, setCurrentTab] = useState(TABS.QR);

    const isActiveTab = tabName => tabName === currentTab;
    const getTabClassName = tabName => `WalletConnectNewPairModal_tab ${isActiveTab(tabName) ? 'active' : ''}`;

    return (
        <div className="WalletConnectNewPairModal">
            <div className="Modal_header">
                <div
                    className={getTabClassName(TABS.QR)}
                    onClick={() => setCurrentTab(TABS.QR)}
                >
                    QR Code
                </div>
                <div
                    className={getTabClassName(TABS.DESKTOP)}
                    onClick={() => setCurrentTab(TABS.DESKTOP)}
                >
                    Desktop
                </div>
                <img
                    src={images['icon-close']}
                    alt="X"
                    onClick={() => {
                        submit.cancel();
                    }}
                />
            </div>
            {currentTab === TABS.QR && <QrCodeContent uri={uri} />}
            {currentTab === TABS.DESKTOP && <DesktopContent uri={uri} />}
        </div>
    );
};

export default WalletConnectNewPairModal;

WalletConnectNewPairModal.propTypes = {
    uri: PropTypes.string.isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
};
