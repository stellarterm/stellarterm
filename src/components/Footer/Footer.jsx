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
                            <a href="https://twitter.com/stellarterm" target="_blank" rel="noopener noreferrer">
                                <img src={images['icon-twitter']} alt="twitter" />
                                @StellarTerm
                            </a>
                            <a href="mailto:support@stellarterm.com">
                                <img src={images['icon-email']} alt="email" />
                                support@stellarterm.com
                            </a>
                            <a href="mailto:partners@stellarterm.com">
                                <img src={images['icon-email']} alt="email" />
                                partners@stellarterm.com
                            </a>
                        </div>

                        <div className="Footer_privacy_links">
                            <Link to="/privacy/">Privacy Policy</Link>
                            <Link to="/terms-of-use/">Terms of use</Link>
                        </div>
                    </div>

                    <div className="Footer_disclaimer">
                        Cryptocurrency assets are subject to high market risks and volatility. Past performance is not
                        indicative of future results. Investments in blockchain assets may result in loss of part or all
                        of your investment. StellarTerm does NOT endorse ANY asset on the Stellar network. Please do
                        your own research and use caution.
                    </div>

                    {isExchangePage ? (
                        <div className="Footer_disclaimer">
                            This product includes software developed at TradingView, Inc. TradingView Lightweight Charts
                            Copyright (с) 2019{' '}
                            <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">
                                TradingView
                            </a>
                            , Inc.
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}

Footer.propTypes = {
    location: PropTypes.objectOf(PropTypes.any),
};

export default withRouter(props => <Footer {...props} />);
