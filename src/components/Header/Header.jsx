import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import isElectron from 'is-electron';
import images from '../../images';
import Driver from '../../lib/Driver';

export default class Header extends React.Component {
    static createHeaderTab(url, text) {
        const rootAddress = window.location.pathname.split('/')[1];
        const isCurrentTab = rootAddress === url ? ' is-current' : '';

        return (
            <Link className={`Nav_link${isCurrentTab}`} to={`/${url}/`}>
                <span>{text}</span>
            </Link>
        );
    }

    constructor(props) {
        super(props);

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

    render() {
        return (
            <div className="Header_main" id="stellarterm_header">
                {this.getNetworkBar()}

                <div className="so-back Header_background">
                    <div className="so-chunk Header">
                        <nav className="Header_nav">
                            <Link className="Nav_logo" to={'/'}>
                                StellarTerm
                            </Link>
                            {this.constructor.createHeaderTab('exchange', 'Exchange')}
                            {this.constructor.createHeaderTab('markets', 'Markets')}
                            {this.getBuyCryptoLobsterLink()}
                            {this.constructor.createHeaderTab('account', 'Account')}
                            {!isElectron() ? this.constructor.createHeaderTab('download', 'Download') : null}
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
