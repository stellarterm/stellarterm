/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import images from '../../images';

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExchangePage: this.props.location.pathname.includes('exchange'),
        };
    }

    componentDidUpdate(prevProps) {
        const currentPath = this.props.location.pathname;

        if (currentPath !== prevProps.location.pathname) {
            this.setState({ isExchangePage: currentPath.includes('exchange') });
        }
    }

    render() {
        const { isExchangePage } = this.state;

        return (
            <div className="so-back Footer">
                <div className="so-chunk Footer_chunk">
                    <div className="Footer_links">
                        <div className="Footer_social_links">
                            <a
                                className="Footer_link"
                                href="https://twitter.com/stellarterm"
                                target="_blank"
                                rel="noopener noreferrer">
                                <img src={images['icon-twitter']} alt="twitter" />
                                @StellarTerm
                            </a>
                            <a href="mailto:support@stellarterm.com" className="Footer_link">
                                <img src={images['icon-email']} alt="email" />
                                support@stellarterm.com
                            </a>
                            <a href="mailto:partners@stellarterm.com" className="Footer_link">
                                <img src={images['icon-email']} alt="email" />
                                partners@stellarterm.com
                            </a>
                        </div>

                        <a
                            className="Footer_link"
                            href="https://stellarterm.zendesk.com/"
                            target="_blank"
                            rel="noopener noreferrer">
                            <img src={images['icon-support']} alt="support" />
                            Support Center
                        </a>
                    </div>
                    <div className="Footer_disclaimer_block">
                        <div className="Footer_disclaimer_column">
                            <div className="Footer_disclaimer">
                            Cryptocurrency assets are subject to high market risks and volatility. Past performance is
                             not indicative of future results. Investments in blockchain assets may result in loss of
                             part or all of your investment. StellarTerm does NOT endorse ANY asset on the Stellar
                             network. Please do your own research and use caution.
                            </div>

                            {isExchangePage ? (
                                <div className="Footer_disclaimer">
                                This product includes software developed at TradingView, Inc. TradingView Lightweight
                                 Charts Copyright (с) 2019{' '}
                                    <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">
                                        TradingView
                                    </a>
                                , Inc.
                                </div>
                            ) : null}
                        </div>
                        <div className="Footer_disclaimer_column">
                            <span className="Footer_version">v{window.stBuildInfo.version}</span>
                            <div className="Footer_privacy_links">
                                <Link to="/privacy/" className="Footer_link">Privacy Policy</Link>
                                <Link to="/terms-of-use/" className="Footer_link">Terms of use</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }
}

Footer.propTypes = {
    location: PropTypes.objectOf(PropTypes.any),
};

export default withRouter(props => <Footer {...props} />);
