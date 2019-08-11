import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../lib/Driver';
import AssetList from '../Common/AssetList/AssetList';
import Sep7Handler from './Sep7Handler/Sep7Handler';


export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.listenId = this.props.driver.session.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentDidMount() {
        Sep7Handler(this.props);
    }

    componentWillUnmount() {
        this.props.driver.session.event.unlisten(this.listenId);
    }

    renderHomePageActions() {
        const state = this.props.driver.session.state;
        if (state !== 'out') { return ''; }

        const signUpLinkClass = 'HomePage__lead__actions__sign-up-button HomePage__lead__actions__button s-button';
        return (
            <div className="HomePage__lead__actions">
                <Link className={signUpLinkClass} to="/signup/">Sign Up</Link>
                &nbsp;
                <Link className="s-button HomePage__lead__actions__button" to="/account/">Login</Link>
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
                        <div className="AssetListFooter">
                            View more assets on the <Link to="/markets/">market list page</Link>.
                        </div>
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
                                        StellarTerm is developed by Ultra Stellar, LLC, the same
                                        company that developed the LOBSTR wallet. The project is
                                        independent of the Stellar Development Foundation.
                                    </p>
                                </div>
                            </div>

                            <div className="island__sub__division">
                                <div className="HomePage__sideBlurb">
                                    <p>
                                        StellarTerm is open source software.
                                        To support the project, please{' '}
                                        <a href="https://github.com/stellarterm/stellarterm" target="_blank" rel="nofollow noopener noreferrer">
                                            star the project on GitHub
                                        </a>.
                                    </p>
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
