import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { isConnected } from '@stellar/freighter-api';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/Driver';
import { isChrome } from '../../../../lib/BrowserSupport';
import AcceptTerms from '../Common/AcceptTerms';


const FreighterBody = ({ history, d, modal }) => {
    const [loginError, setLoginError] = useState('');

    const loginWithFreighter = (event) => {
        event.preventDefault();
        setLoginError('');
        d.session.handlers.logInWithFreighter()
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

    const getFreighterLoginForm = () => {
        if (!isChrome()) {
            return (
                <p className="LoginPage__form--title browser-support">
                    Freighter extension is not supported by your browser.
                    <br />
                    Please use Google Chrome.
                </p>
            );
        }
        if (!isConnected()) {
            return (
                <Fragment>
                    <p className="LoginPage__form--title browser-support">
                        Freighter extension is not installed.
                    </p>
                    <a
                        className="LoginPage__link"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        href="https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk">
                        Install Freighter
                    </a>
                </Fragment>
            );
        }
        const loginErrorView = renderLoginError();
        return (
            <form onSubmit={loginWithFreighter}>
                <div className="LoginPage__submitWrap">
                    {loginErrorView}
                    <AcceptTerms loginButtonText={'Sign in with Freighter'} />
                </div>
            </form>
        );
    };

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getFreighterLoginForm()}</div>
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
                            alt="<" />
                        <HiddenDescription />
                    </div>
                    <div className="LoginPage__header">
                        <div className="LoginPage__header-wrap">
                            <span className="LoginPage__title">Access your account</span>
                            <span className="LoginPage__intro">Use StellarTerm with your Freighter extension</span>
                        </div>
                        <img src={images['freighter-logo-main']} alt="freighter" height="66" />
                    </div>
                    <div className="LoginPage__greenBox">
                        {getFreighterLoginForm()}
                    </div>
                </div>
                <SecretPhrase d={d} />
            </div>
        </React.Fragment>
    );
};

export default FreighterBody;

FreighterBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
