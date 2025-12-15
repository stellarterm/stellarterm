import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import createStellarIdenticon from 'stellar-identicon-js';
import images from '../../images';
import Driver from '../../lib/driver/Driver';
import AppPopover from '../Common/AppPopover/AppPopover';
import { SESSION_STATE } from '../../lib/constants/sessionConstants';
import PreferredHorizon from './PreferredHorizon/PreferredHorizon';

const Header = ({ d }) => {
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [showPopup, setShowPopup] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const forceUpdate = () => {
        setCurrentPath(window.location.pathname + Math.random()); // Dummy trigger
    };

    useEffect(() => {
        const unlisten = d.session.event.sub(() => {
            forceUpdate();
        });
        return () => unlisten();
    }, [d]);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location]);

    const handleCopy = (popupShowType, text) => {
        window.navigator.clipboard.writeText(text);
        setShowPopup(popupShowType);
        setTimeout(() => setShowPopup(''), 1000);
    };

    const getBuyCryptoLobsterLink = () => {
        const buyCryptoUrl = '/buy-crypto';
        const isTheSameTab = currentPath.includes(buyCryptoUrl);
        const currentTabClass = isTheSameTab ? 'is-current' : '';

        return (
            <div className={`Nav_link buy_crypto ${currentTabClass}`}>
                <span>Buy crypto </span>
                <img src={images['icon-visa-mc']} alt="credit-card" className="cards_logo" />
                <img src={images.dropdown} alt="" />
                <div className="buy_crypto-links">
                    <Link className="buy_crypto-link" to="/buy-crypto?crypto=xlm&network=stellar">
                        Buy Stellar Lumens
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?crypto=usdc&network=stellar">
                        Buy USDC Coin (Stellar)
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?crypto=btc&network=bitcoin">
                        Buy Bitcoin
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?crypto=eth&network=ethereum">
                        Buy Ethereum
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?crypto=ltc&network=litecoin">
                        Buy Litecoin
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto">
                        Buy other crypto
                    </Link>
                </div>
            </div>
        );
    };

    const getNetworkBar = () => {
        const { isDefault, currentServerUrl, networkPassphrase } = d.Server;
        return !isDefault ? (
            <div className="so-back Header_network">
                <div className="so-chunk">
                    <div className="Network_bar">
                        <span>
                            Horizon url: <strong>{currentServerUrl}</strong>
                        </span>
                        <span>
                            Network passphrase: <strong>{networkPassphrase}</strong>
                        </span>
                    </div>
                </div>
            </div>
        ) : null;
    };

    const getAccountBlock = () => {
        const { state, account, userFederation, unfundedAccountId } = d.session;
        const hasMetadata = Boolean(d.walletConnectService.appMeta);

        if (state === SESSION_STATE.OUT) {
            return (
                <div className="Header_login">
                    <Link className="Header_login-button" to="/signup/">
                        <img src={images['icon-sign-up']} alt="sign" />
                        <span>NEW ACCOUNT</span>
                    </Link>
                    <Link className="Header_login-button" to="/account/">
                        <img src={images['icon-login']} alt="login" />
                        <span>LOGIN</span>
                    </Link>
                </div>
            );
        }

        if (state === SESSION_STATE.LOADING) {
            return null;
        }

        const fullFederation = `${userFederation}*stellarterm.com`;
        const accountId = (account && account.account_id) || unfundedAccountId;
        const viewPublicKey = `${accountId.substr(0, 5)}...${accountId.substr(-5)}`;
        const canvas = createStellarIdenticon(accountId);
        const renderedIcon = canvas.toDataURL();

        return (
            <div className="Header_account">
                <div className="Header_account-info CopyButton">
                    <span className="federation" onClick={() => handleCopy('federationPopup', fullFederation)}>
                        {userFederation}
                    </span>
                    <span
                        className="public-key"
                        onClick={() => handleCopy(!userFederation ? 'federationPopup' : 'publicKeyPopup', accountId)}
                    >
                        {viewPublicKey}
                    </span>
                    <div className={`CopyButton__popup ${showPopup}`}>Copied to clipboard</div>
                </div>
                <div className="Header_account-icon">
                    <img src={renderedIcon} alt="icon" />
                </div>
                {hasMetadata && (
                    <AppPopover
                        hoverArea={
                            <div className="Header_app-icon">
                                <img src={d.walletConnectService.appMeta.icons[0]} alt="" />
                            </div>
                        }
                        content={<span>Account connected with WalletConnect</span>}
                    />
                )}
            </div>
        );
    };

    const checkAccountTab = url =>
        url === '/account/' &&
        (currentPath.includes('ledger') ||
            currentPath.includes('signup') ||
            currentPath.includes('trezor') ||
            currentPath.includes('freighter'));

    const createHeaderTab = (url, text) => {
        const isTheSameTab = currentPath.includes(url);
        const isAccountTab = checkAccountTab(url);
        const currentTabClass = isTheSameTab || isAccountTab ? 'is-current' : '';

        return (
            <Link to={url} className={`Nav_link ${currentTabClass}`}>
                <span>{text}</span>
            </Link>
        );
    };

    return (
        <div className="Header_main" id="stellarterm_header">
            {getNetworkBar()}

            <div className="so-back Header_background">
                <div className="so-chunk Header">
                    <nav className="Header_nav">
                        <Link className="Nav_logo" to={'/'}>
                            StellarTerm
                        </Link>
                        {createHeaderTab('/swap/', 'Swap')}
                        {createHeaderTab('/markets/', 'Markets')}
                        {createHeaderTab('/exchange/', 'Exchange')}
                        {getBuyCryptoLobsterLink()}
                        {createHeaderTab('/account/', 'Account')}
                    </nav>

                    {getAccountBlock()}

                    <div
                        className="Header_settings"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <img src={images['icon-settings']} alt="settings" className="Header_settings_icon" />
                        <img
                            src={images['icon-settings-white']}
                            alt="settings"
                            className="Header_settings_icon--hover"
                        />

                        {isHovered && (
                            <div className="Header_settings_menu">
                                <PreferredHorizon d={d} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

Header.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

export default Header;
