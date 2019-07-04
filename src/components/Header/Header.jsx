import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

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
            <div className="Header_main">
                {this.getNetworkBar()}

                <div className="so-back Header_background">
                    <div className="so-chunk Header">

                        <nav className="Header_nav">
                            <Link className="Nav_logo" to={'/'}>StellarTerm</Link>
                            {this.constructor.createHeaderTab('exchange', 'Exchange')}
                            {this.constructor.createHeaderTab('markets', 'Markets')}
                            {this.constructor.createHeaderTab('account', 'Account')}
                            {this.constructor.createHeaderTab('download', 'Download')}
                        </nav>

                        <span className="Header_version">v{window.stBuildInfo.version}</span>

                    </div>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    network: PropTypes.shape({
        horizonUrl: PropTypes.string,
        isCustom: PropTypes.bool,
        isDefault: PropTypes.bool,
        isTestnet: PropTypes.bool,
        networkPassphrase: PropTypes.string,
    }).isRequired,
};
