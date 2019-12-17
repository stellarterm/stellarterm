import React from 'react';
import images from '../../../images';

export default function HomeAlert() {
    return (
        <div className="Alert-block" onClick={() => window.open('https://stellarcommunity.fund/', '_blank')}>
            <div className="icon-block">
                <img src={images['XLM-white']} alt="XLM" />
            </div>

            <div className="content-block">
                <div className="content-title">
                    Stellar Community Fund competition
                </div>

                <div className="content-text">
                    Don’t miss a chance to support StellarTerm and other great
                    projects building on Stellar, which participate in third
                    Stellar Community Fund (SCF) competition.
                </div>

                <ol className="content-steps">
                    <li>Sign in with Keybase</li>
                    <li>Choose at least 3 projects</li>
                    <li>Submit your selection</li>
                </ol>
            </div>

            <div className="content-link">
                <span>VOTE</span>
                <img src={images['icon-arrow-right-white']} alt="arrow-right" />
            </div>
        </div>
    );
}
