import React from 'react';
import PropTypes from 'prop-types';

export default class Header extends React.Component {
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
        const { rootAddress } = this.props;
        const isCurrentTab = rootAddress === url ? ' is-current' : '';

        return (
            <a className={`Nav_link${isCurrentTab}`} href={`#${url}`}>
                <span>{text}</span>
            </a>
        );
    }

    render() {
        return (
            <div className="Header_main">
                {this.getNetworkBar()}

                <div className="so-back Header_background">
                    <div className="so-chunk Header">

                        <nav className="Header_nav">
                            <a className="Nav_logo" href="/#">StellarTerm</a>
                            {this.createHeaderTab('exchange', 'Exchange')}
                            {this.createHeaderTab('markets', 'Markets')}
                            {this.createHeaderTab('account', 'Account')}
                            {this.createHeaderTab('download', 'Download')}
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
    rootAddress: PropTypes.string.isRequired,
};
