import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../Common/Generic/Generic';

export default function TermsOfUse(props) {
    return (
        <Generic>
            <h2 className="WelcomeTitle">Terms of use</h2>

            <h3>1. Cryptocurrency risks</h3>
            <p className="termsOfUse__Paragraph">
                Cryptocurrency assets are subject to high market risks and volatility.
                <strong> Past performance is not indicative of future results</strong>. Investments in blockchain assets
                may result in loss of part or all of your investment. Please do your own research and use caution. You
                are solely responsible for your actions on the{' '}
                <a href="https://www.stellar.org/" target="_blank" rel="nofollow noopener noreferrer">
                    Stellar network
                </a>
                . StellarTerm is not responsible for your investment losses.
                <br />
                <br />
                Cryptocurrency assets and the Stellar {'"decentralized exchange"'} are <strong>unregulated</strong> and
                does not have governmental oversight. The SEC has recently issued a {'"'}
                <a
                    href="https://www.sec.gov/news/public-statement/statement-clayton-2017-12-11"
                    target="_blank"
                    rel="nofollow noopener noreferrer">
                    Statement on Cryptocurrencies and Initial Coin Offerings
                </a>
                {'" '}
                that may be of interest to you.
            </p>

            <h3>2. The Stellar network (separate from StellarTerm)</h3>
            <p className="termsOfUse__Paragraph">
                StellarTerm is <strong>not an exchange</strong>. StellarTerm is <strong>only a user interface </strong>
                to Stellar and does not operate the{' '}
                <a href="https://www.stellar.org/" target="_blank" rel="nofollow noopener noreferrer">
                    Stellar network
                </a>
                . StellarTerm is unable to control the actions of others on the{' '}
                <a href="https://www.stellar.org/" target="_blank" rel="nofollow noopener noreferrer">
                    {' '}
                    Stellar network
                </a>
                . When using StellarTerm, you are directly communicating with the Horizon Stellar API operated by
                Stellar Development Foundation. Transactions on the{' '}
                <a href="https://www.stellar.org/" target="_blank" rel="nofollow noopener noreferrer">
                    Stellar network
                </a>{' '}
                are <strong>irreversible</strong>. StellarTerm is not a custodian of your assets. We do not store any
                tokens, cryptoassets or private keys on your behalf.
            </p>

            <h3>3. Privacy</h3>
            <p className="termsOfUse__Paragraph">
                Your privacy is important to us. Please read the <a href="#privacy">privacy policy</a> for more
                information.
            </p>

            <h3>4. StellarTerm does not endorse anything</h3>
            <p className="termsOfUse__Paragraph">
                StellarTerm <strong>does NOT endorse ANY</strong> asset on the{' '}
                <a href="https://www.stellar.org/" target="_blank" rel="nofollow noopener noreferrer">
                    Stellar network
                </a>
                . Asset {'"listings"'} on StellarTerm are NOT endorsements. StellarTerm is a software client ONLY and
                does NOT conduct any independent diligence or review of any asset. Stellar is an open system meaning
                that scams and market manipulators may exist. Prices shown on StellarTerm are for informational purposes
                and do not imply that they can actually be redeemed for a certain price.
            </p>

            <h3>5. Your own responsibilities</h3>
            <p className="termsOfUse__Paragraph">
                You, the user, are solely responsible for ensuring your own compliance with laws and taxes in your
                jurisdiction. Cryptocurrencies may be illegal in your area. You, are solely responsible for your own
                security including keeping your account secret keys safe and backed up.
            </p>

            <h3>6. Disclaimer of warranty</h3>
            <p className="termsOfUse__Paragraph">
                StellarTerm is open source software licensed under the{' '}
                <a
                    href="https://www.apache.org/licenses/LICENSE-2.0"
                    target="_blank"
                    rel="nofollow noopener noreferrer">
                    Apache-2.0 license
                </a>
                . It is provided free of charge and on an{' '}
                <strong>{'"AS IS"'} BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND</strong>.
                <br />
                <br />
            </p>
            {props.accept ? (
                <div>
                    By pressing {'<strong>Accept and Continue</strong>'}, you acknowledge that you have read this
                    document and agree to these terms of use.
                    <div className="AcceptTerms_block">
                        <button className="s-button" onClick={props.accept}>
                            Accept and Continue
                        </button>
                    </div>
                </div>
            ) : null}
        </Generic>
    );
}

TermsOfUse.propTypes = {
    accept: PropTypes.func,
};
