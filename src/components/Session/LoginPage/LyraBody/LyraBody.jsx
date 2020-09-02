import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isConnected } from '@stellar/lyra-api';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/Driver';
import { isChrome } from '../../../../lib/BrowserSupport';
import AcceptTerms from '../Common/AcceptTerms';


const LyraBody = ({ history, d, modal }) => {
    const [loginError, setLoginError] = useState('');

    const loginWithLyra = (event) => {
        event.preventDefault();
        setLoginError('');
        d.session.handlers.logInWithLyra()
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

    const getLyraLoginForm = () => {
        if (!isChrome()) {
            return (
                <p className="LoginPage__form--title browser-support">
                    Lyra extension is available in chrome only
                </p>
            );
        }
        if (!isConnected()) {
            return (
                <p className="LoginPage__form--title browser-support">
                    Lyra extension is not installed
                </p>
            );
        }
        const loginErrorView = renderLoginError();
        return (
            <form onSubmit={loginWithLyra}>
                <div className="LoginPage__submitWrap">
                    {loginErrorView}
                    <AcceptTerms loginButtonText={'Sign in with Lyra'} />
                </div>
            </form>
        );
    };

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getLyraLoginForm()}</div>
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
                            <span className="LoginPage__intro">Use StellarTerm with your Lyra extension</span>
                        </div>
                        <img src={images.lyra} alt="trezor" width="40" />
                    </div>
                    <div className="LoginPage__greenBox">
                        {getLyraLoginForm()}
                    </div>
                </div>
                <SecretPhrase d={d} />
            </div>
        </React.Fragment>
    );
};

export default LyraBody;

LyraBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
