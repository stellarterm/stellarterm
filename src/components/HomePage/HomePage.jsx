import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../lib/driver/Driver';
import AssetList from '../Common/AssetList/AssetList';
import Sep7Handler from './Sep7Handler/Sep7Handler';
import { SESSION_STATE } from '../../lib/constants/sessionConstants';
import images from '../../images';


export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.unsub = this.props.driver.session.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentDidMount() {
        Sep7Handler(this.props.driver);
    }

    componentWillUnmount() {
        this.unsub();
    }

    renderHomePageActions() {
        const state = this.props.driver.session.state;
        if (state !== SESSION_STATE.OUT) { return ''; }

        const signUpLinkClass = 'HomePage__lead__actions__sign-up-button HomePage__lead__actions__button s-button';
        return (
            <div className="HomePage__lead__actions">
                <Link className={signUpLinkClass} to="/signup/">New account</Link>
                &nbsp;
                <Link className="s-button HomePage__lead__actions__button" to="/account/">Log in</Link>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="HomePage__black">
                    <div className="so-back">
                        <div className="HomePage__lead">

                            <h2 className="HomePage__lead__title">
                                Trade on the <Link to="/exchange/">Stellar Decentralized Exchange</Link>
                            </h2>

                            <p className="HomePage__lead__summary">
                                StellarTerm is an <a href="https://github.com/stellarterm/stellarterm" target="_blank" rel="nofollow noopener noreferrer">
                                open source</a> client for the <a href="https://www.stellar.org/" target="_blank" rel="nofollow noopener noreferrer">
                                Stellar network</a>.
                                <br />
                                Send, receive, and <Link to="/exchange/">trade</Link> assets on the Stellar
                                network easily with StellarTerm.
                            </p>
                            {this.renderHomePageActions()}
                        </div>
                    </div>
                </div>

                <div className="so-back islandBack HomePage__assetList">
                    <div className="island">
                        <AssetList d={this.props.driver} limit={6} />
                        <Link to="/markets/" className="AssetListFooterAsLink">
                            View more assets on the Markets page
                            <img src={images['icon-arrow-right-green']} alt="" />
                        </Link>
                    </div>
                </div>

                <div className="so-back islandBack">
                    <div className="island">
                        <div className="island__sub">

                            <div className="island__sub__division">
                                <div className="HomePage__sideBlurb">
                                    <p>
                                        StellarTerm is just a client that can be used to
                                        access the Stellar Decentralized Exchange. Neither
                                        StellarTerm nor the developers of it are involved with
                                        operating the Stellar network.
                                    </p>
                                    <p>
                                        StellarTerm is open source software.
                                        To support the project, please{' '}
                                        <a
                                            href="https://github.com/stellarterm/stellarterm" target="_blank"
                                            rel="nofollow noopener noreferrer"
                                        >
                                            star the project on GitHub
                                        </a>.
                                    </p>
                                </div>
                            </div>

                            <div className="island__sub__division">
                                <div className="HomePage__sideBlurb">
                                    <p>
                                        The project is released under the
                                        Apache-2.0 license and is released as is
                                        without warranty.
                                    </p>
                                    <p>
                                        StellarTerm is not a custodian of your assets.{' '}
                                        We do not store any tokens, cryptoassets
                                        or private keys on your behalf.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

HomePage.propTypes = {
    driver: PropTypes.instanceOf(Driver).isRequired,
};
