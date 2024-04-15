import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isConnected } from '@lobstrco/signer-extension-api';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/driver/Driver';
import AcceptTerms from '../Common/AcceptTerms';
import { isChrome } from '../../../../lib/helpers/BrowserSupport';
import InfoBlock from '../../../Common/InfoBlock/InfoBlock';


const LobstrExtensionBody = ({ history, d, modal }) => {
    const [loginError, setLoginError] = useState('');
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        isConnected().then(res => setIsInstalled(res));
    }, []);

    const loginWithLobstrExtension = event => {
        event.preventDefault();
        setLoginError('');
        d.session.handlers.logInWithLobstrExtension()
            .catch(e => setLoginError(e));
    };

    const renderLoginError = () => {
        if (loginError) {
            return (
                <div className="ErrorTransactionBlock">
                    <img src={images['icon-circle-fail']} alt="fail" />
                    <span>
                        {loginError}
                    </span>
                </div>
            );
        }
        return null;
    };

    const getLobstrExtensionLoginForm = () => {
        if (!isInstalled) {
            return (
                <Fragment>
                    <p className="LoginPage__form--title browser-support">
                        LOBSTR signer extension is not installed.
                    </p>
                    <a
                        className="LoginPage__link"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        href="https://chromewebstore.google.com/detail/lobstr-signer-extension/ldiagbjmlmjiieclmdkagofdjcgodjle"
                    >
                        Install LOBSTR signer extension
                    </a>
                </Fragment>
            );
        }
        const loginErrorView = renderLoginError();
        return (
            <form onSubmit={loginWithLobstrExtension}>
                <div className="LoginPage__submitWrap">
                    {loginErrorView}
                    <AcceptTerms loginButtonText={'Log in with LOBSTR'} />
                </div>
            </form>
        );
    };

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getLobstrExtensionLoginForm()}</div>
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
                            <span
                                className="LoginPage__intro"
                            >Use StellarTerm with your LOBSTR wallet</span>
                        </div>
                        <img src={images['lobstr-extension']} alt="lobstr extension logo" height="32" />
                    </div>
                    {isChrome() ?
                        <div className="LoginPage__greenBox">
                            {getLobstrExtensionLoginForm()}
                        </div> :
                        <InfoBlock type="warning" withIcon title="Browser not supported">
                            <span>
                                LOBSTR signer extension is not supported by your browser.<br />
                                Please use Google Chrome to log in with your LOBSTR wallet.
                            </span>
                        </InfoBlock>
                    }
                    <a
                        className="LoginPage_green-link"
                        href="https://stellarterm.freshdesk.com/a/solutions/articles/151000183965?portalId=151000026553"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                    >
                        How do I log in with LOBSTR signer extension?
                    </a>
                </div>
                <SecretPhrase d={d} />
            </div>
        </React.Fragment>
    );
};

export default LobstrExtensionBody;

LobstrExtensionBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
