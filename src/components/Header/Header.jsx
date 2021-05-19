import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import isElectron from 'is-electron';
import createStellarIdenticon from 'stellar-identicon-js';
import images from '../../images';
import Driver from '../../lib/Driver';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showPopup: '',
            currentPath: window.location.pathname,
        };

        this.listenId = this.props.d.session.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentDidUpdate(prevProps) {
        const currentPath = this.props.location.pathname;

        if (currentPath !== prevProps.location.pathname) {
            this.setState({ currentPath });
        }
    }

    componentWillUnmount() {
        this.props.d.session.event.unlisten(this.listenId);
    }

    getBuyCryptoLobsterLink() {
        const buyCryptoUrl = '/buy-crypto';
        const isTheSameTab = this.state.currentPath.includes(buyCryptoUrl);
        const currentTabClass = isTheSameTab ? 'is-current' : '';

        return (
            <div className={`Nav_link buy_crypto ${currentTabClass}`}>
                <span>Buy crypto </span>
                <img src={images['icon-visa-mc']} alt="credit-card" className="cards_logo" />
                <img src={images.dropdown} alt="" />
                <div className="buy_crypto-links">
                    <Link className="buy_crypto-link" to="/buy-crypto?code=xlm">
                        Buy Stellar Lumens
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?code=btc">
                        Buy Bitcoin
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?code=eth">
                        Buy Ethereum
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto?code=ltc">
                        Buy Litecoin
                    </Link>
                    <Link className="buy_crypto-link" to="/buy-crypto">
                        Buy other crypto
                    </Link>
                </div>
            </div>
        );
    }

    getNetworkBar() {
        const { isDefault, currentServerUrl, networkPassphrase } = this.props.d.Server;

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
    }

    getAccountBlock() {
        const { state, account, userFederation, unfundedAccountId } = this.props.d.session;
        const { showPopup } = this.state;

        if (state === 'out') {
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
        if (state === 'loading') {
            return null;
        }
        const fullFederation = `${userFederation}*stellarterm.com`;
        const accountId = (account && account.account_id) || unfundedAccountId;
        const viewPublicKey = `${accountId.substr(0, 5)}...${accountId.substr(-5, 5)}`;
        const canvas = createStellarIdenticon(accountId);
        const renderedIcon = canvas.toDataURL();

        return (
            <div className="Header_account">
                <div className="Header_account-info CopyButton">
                    <span className="federation" onClick={() => this.handleCopy('federationPopup', fullFederation)}>
                        {userFederation}
                    </span>
                    <span
                        className="public-key"
                        onClick={() =>
                            this.handleCopy(!userFederation ? 'federationPopup' : 'publicKeyPopup', accountId)
                        }
                    >
                        {viewPublicKey}
                    </span>
                    <div className={`CopyButton__popup ${showPopup}`}>Copied to clipboard</div>
                </div>
                <div className="Header_account-icon">
                    <img src={renderedIcon} alt="icon" />
                </div>
            </div>
        );
    }

    handleCopy(popupShowType, text) {
        window.navigator.clipboard.writeText(text);
        this.setState({ showPopup: popupShowType });
        setTimeout(() => this.setState({ showPopup: '' }), 1000);
    }

    checkAccountTab(url) {
        const { currentPath } = this.state;
        return (
            url === '/account/' &&
            (currentPath.includes('ledger') ||
                currentPath.includes('signup') ||
                currentPath.includes('trezor') ||
                currentPath.includes('freighter'))
        );
    }

    createHeaderTab(url, text) {
        const { currentPath } = this.state;
        const isTheSameTab = currentPath.includes(url);
        const isAccountTab = this.checkAccountTab(url);
        const currentTabClass = isTheSameTab || isAccountTab ? 'is-current' : '';

        return (
            <Link to={url} className={`Nav_link ${currentTabClass}`}>
                <span>{text}</span>
            </Link>
        );
    }

    render() {
        const accountBlock = this.getAccountBlock();
        return (
            <div className="Header_main" id="stellarterm_header">
                {this.getNetworkBar()}

                <div className="so-back Header_background">
                    <div className="so-chunk Header">
                        <nav className="Header_nav">
                            <Link className="Nav_logo" to={'/'}>
                                StellarTerm
                            </Link>
                            {this.createHeaderTab('/markets/', 'Markets')}
                            {this.createHeaderTab('/exchange/', 'Exchange')}
                            {this.getBuyCryptoLobsterLink()}
                            {this.createHeaderTab('/account/', 'Account')}
                            {!isElectron() ? this.createHeaderTab('/download/', 'Download') : null}
                        </nav>

                        {accountBlock}
                    </div>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    location: PropTypes.objectOf(PropTypes.any),
};

export default withRouter(props => <Header {...props} />);
