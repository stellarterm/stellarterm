import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../../../images';

const HARDWARE_WALLET_DATA = {
    ledger: {
        link: '/ledger/',
        capitalizedName: 'Ledger',
        capitalizedFullName: 'Ledger device',
        logo: 'ledger-logo-main',
    },
    trezor: {
        link: '/trezor/',
        capitalizedName: 'Trezor',
        capitalizedFullName: 'Trezor device',
        logo: 'trezor-mini',
    },
    freighter: {
        link: '/freighter/',
        capitalizedName: 'Freighter',
        capitalizedFullName: 'Freighter extension',
        logo: 'freighter-logo',
    },
};
export default function HardwareWalletLoginLink(props) {
    const { narrow } = props;
    // eslint-disable-next-line react/prop-types
    const { link, capitalizedName, capitalizedFullName, logo } = HARDWARE_WALLET_DATA[props.wallet];
    return (
        <Link to={link} className={`HardwareWalletLoginLink ${narrow ? 'narrow' : ''}`}>
            <div className="HardwareWalletLoginLink_wrap">
                <div className="HardwareWalletLoginLink_logo">
                    <img src={images[logo]} alt={capitalizedName} height="40" width="40" />
                </div>
                <div className="HardwareWalletLoginLink_description">
                    <span className="HardwareWalletLoginLink_description-title">Log in with {capitalizedName}</span>
                    <span>Use StellarTerm to access your account on {capitalizedFullName}</span>
                </div>
            </div>
            <img src={images['icon-arrow-right-green-small']} alt=">" />
        </Link>
    );
}
HardwareWalletLoginLink.propTypes = {
    narrow: PropTypes.bool,
    wallet: PropTypes.oneOf(['ledger', 'trezor', 'freighter']).isRequired,
};
