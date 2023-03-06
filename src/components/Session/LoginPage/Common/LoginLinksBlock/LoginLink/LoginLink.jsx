import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../../../../images';

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
    freighter: {
        link: '/freighter/',
        capitalizedName: 'Freighter',
        logo: 'freighter-logo',
    },
    walletConnect: {
        link: '/wallet-connect/',
        capitalizedName: 'WalletConnect',
        logo: 'walletconnect-logo',
        withLobstrTooltip: true,
    },
};
export default function LoginLink(props) {
    // eslint-disable-next-line react/prop-types
    const { link, capitalizedName, logo, withLobstrTooltip } = HARDWARE_WALLET_DATA[props.wallet];
    return (
        <Link to={link} className="LoginLink">
            <div className="LoginLink_wrap">
                <div className="LoginLink_logo">
                    <img src={images[logo]} alt={capitalizedName} />
                </div>
                <div className="LoginLink_description">
                    <span>{capitalizedName}</span>
                </div>
            </div>
            <img src={images['icon-arrow-right-black-small']} className="LoginLink_arrow" alt=">" />

            {withLobstrTooltip &&
                <div className="LoginLink_lobstr-tooltip">
                    <img src={images['lobstr-logo']} alt="lobstr" />
                    Available in LOBSTR wallet
                </div>
            }
        </Link>
    );
}
LoginLink.propTypes = {
    wallet: PropTypes.oneOf(['ledger', 'trezor', 'freighter', 'walletConnect']).isRequired,
};
