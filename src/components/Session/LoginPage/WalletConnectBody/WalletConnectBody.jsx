import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/driver/Driver';
import AcceptTerms from '../Common/AcceptTerms';


const WalletConnectBody = ({ history, d, modal }) => {
    const [loading, setLoading] = useState(false);
    let mounted = true;

    useEffect(() => () => {
        // unmount effect
        mounted = false;
    }, []);

    const loginWithWalletConnect = e => {
        setLoading(true);
        e.preventDefault();

        d.session.handlers.loginWithWalletConnect().then(() => {
            if (mounted) {
                setLoading(false);
            }
        });
    };

    const getWalletConnectLoginForm = () => (
        <form onSubmit={loginWithWalletConnect}>
            <div className="LoginPage__submitWrap">

                <AcceptTerms loginButtonText={'Log in with WalletConnect'} loading={loading} />
            </div>
        </form>
    );

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getWalletConnectLoginForm()}</div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <div className="LoginPage_row-content">
                <div className="LoginPage__body">
                    <div className="LoginPage__header">
                        <img
                            onClick={() => history.goBack()}
                            className="LoginPage__header-goBack"
                            src={images['icon-arrow-left-green-large']}
                            alt="<"
                        />
                        <HiddenDescription />
                    </div>
                    <div className="LoginPage__header">
                        <div className="LoginPage__header-wrap">
                            <span className="LoginPage__title">Access your account</span>
                            <span className="LoginPage__intro">
                                Use Zingy Trader with WalletConnect-compatible app
                            </span>
                        </div>
                        <div className="WalletConnect_logo">
                            <div>
                                <img src={images['walletconnect-logo']} alt="wc" height="15" />
                                <span
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        marginLeft: 4,
                                        color: '#000',
                                        lineHeight: '15px',
                                    }}
                                >
                                WalletConnect
                                </span>
                            </div>

                            <div className="LoginLink_lobstr-tooltip">
                                <img src={images['lobstr-logo']} alt="lobstr" />
                                Available in LOBSTR wallet
                            </div>
                        </div>
                    </div>
                    <div className="LoginPage__greenBox">
                        {getWalletConnectLoginForm()}
                    </div>
                    <a
                        className="LoginPage_green-link"
                        href="https://stellarterm.freshdesk.com/support/solutions/articles/151000012438-walletconnect-how-do-i-log-in-to-Zingy Trader-with-my-wallet-app"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                    >
                        How do I log in with WalletConnect?
                    </a>
                </div>
                <SecretPhrase d={d} />
            </div>
        </React.Fragment>
    );
};

export default WalletConnectBody;

WalletConnectBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
