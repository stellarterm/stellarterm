import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../../../images';

const HARDWARE_WALLET_DATA = {
    ledger: {
        link: '/ledger/',
        capitalizedName: 'Ledger',
        logo: 'ledger-logo-main',
    },
    trezor: {
        link: '/trezor/',
        capitalizedName: 'Trezor',
        logo: 'trezor-mini',
    },
};
export default function HardwareWalletLoginLink(props) {
    const { narrow } = props;
    // eslint-disable-next-line react/prop-types
    const { link, capitalizedName, logo } = HARDWARE_WALLET_DATA[props.wallet];
    return (
        <Link to={link} className={`HardwareWalletLoginLink ${narrow ? 'narrow' : ''}`}>
            <div className="HardwareWalletLoginLink_wrap">
                <div className="HardwareWalletLoginLink_logo">
                    <img src={images[logo]} alt={capitalizedName} height="40" width="40" />
                </div>
                <div className="HardwareWalletLoginLink_description">
                    <span className="HardwareWalletLoginLink_description-title">Log in with {capitalizedName}</span>
                    <span>Use StellarTerm to access your account on {capitalizedName} device</span>
                </div>
            </div>
            <img src={images['icon-arrow-right-green-small']} alt=">" />
        </Link>
    );
}
HardwareWalletLoginLink.propTypes = {
    narrow: PropTypes.bool,
    wallet: PropTypes.oneOf(['ledger', 'trezor']).isRequired,
};
