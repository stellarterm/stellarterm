import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';

const DesktopContent = ({ uri }) => (
    <div className="WalletConnectNewPairModal_content">
        <div className="WalletConnectNewPairModal_title">
            Log in with
        </div>
        <a
            className="DesktopContent_link"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://albedo.link/wc?uri=${encodeURIComponent(uri)}`}
        >
            <img src={images['albedo-logo']} className="DesktopContent_link-logo" alt="" />
            <div className="DesktopContent_link-title">Albedo</div>
            <img src={images['icon-arrow-right-black-small']} className="DesktopContent_link-arrow" alt=">" />
        </a>
    </div>
);
DesktopContent.propTypes = {
    uri: PropTypes.string.isRequired,
};

export default DesktopContent;
