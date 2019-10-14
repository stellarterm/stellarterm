import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import isElectron from 'is-electron';
import images from '../../images';
import Driver from '../../lib/Driver';

export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTab: '/',
        };

        this.listenId = this.props.d.session.event.listen(() => {
            this.forceUpdate();
        });
    }

    getBuyCryptoLobsterLink() {
        const { account } = this.props.d.session;
        const accountID = account === null ? '' : account.accountId();
        const targetAddressParam = accountID !== '' ? `?target_address=${accountID}` : '';

        return (
            <a
                className={'Nav_link buy_crypto'}
                href={`https://lobstr.co/buy-crypto${targetAddressParam}`}
                target="_blank"
                rel="nofollow noopener noreferrer">
                <span>Buy Lumens </span>
                <img src={images['icon-visa-mc']} alt="credit-card" />
            </a>
        );
    }

    getNetworkBar() {
        const { isDefault, horizonUrl, networkPassphrase } = this.props.network;

        return !isDefault ? (
            <div className="so-back Header_network">
                <div className="so-chunk">
                    <div className="Network_bar">
                        <span>
                            Horizon url: <strong>{horizonUrl}</strong>
                        </span>
                        <span>
                            Network passphrase: <strong>{networkPassphrase}</strong>
                        </span>
                    </div>
                </div>
            </div>
        ) : null;
    }

    createHeaderTab(url, text) {
        const currentTabClass = this.state.currentTab === url ? ' is-current' : '';

        return (
            <Link to={url} className={`Nav_link${currentTabClass}`} onClick={() => this.clickHeaderItem(url)}>
                <span>{text}</span>
            </Link>
        );
    }

    clickHeaderItem(tabClicked) {
        this.setState({ currentTab: tabClicked });
    }

    render() {
        return (
            <div className="Header_main" id="stellarterm_header">
                {this.getNetworkBar()}

                <div className="so-back Header_background">
                    <div className="so-chunk Header">
                        <nav className="Header_nav">
                            <Link className="Nav_logo" to={'/'} onClick={() => this.clickHeaderItem('/')}>
                                StellarTerm
                            </Link>
                            {this.createHeaderTab('/exchange/', 'Exchange')}
                            {this.createHeaderTab('/markets/', 'Markets')}
                            {this.getBuyCryptoLobsterLink()}
                            {this.createHeaderTab('/account/', 'Account')}
                            {!isElectron() ? this.createHeaderTab('/download/', 'Download') : null}
                        </nav>

                        <span className="Header_version">v{window.stBuildInfo.version}</span>
                    </div>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    network: PropTypes.shape({
        horizonUrl: PropTypes.string,
        isCustom: PropTypes.bool,
        isDefault: PropTypes.bool,
        isTestnet: PropTypes.bool,
        networkPassphrase: PropTypes.string,
    }).isRequired,
};
