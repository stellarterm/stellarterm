import React from 'react';
import images from '../../images';

export default () => (
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
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms-of-use">Terms of use</a>
                </div>
            </div>

            <div className="Footer_disclaimer">
                Cryptocurrency assets are subject to high market risks and volatility. Past performance is not
                indicative of future results. Investments in blockchain assets may result in loss of part or all of your
                investment. StellarTerm does NOT endorse ANY asset on the Stellar network. Please do your own research
                and use caution.
            </div>
        </div>
    </div>
);
