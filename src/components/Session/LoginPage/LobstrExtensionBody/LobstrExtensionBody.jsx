import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isConnected } from '../../../../lib/api/lobstr-signer-extension-api/build/index.min';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/driver/Driver';
import AcceptTerms from '../Common/AcceptTerms';


const LobstrExtensionBody = ({ history, d, modal }) => {
    const [loginError, setLoginError] = useState('');

    const [isExtensionConnected, setIsExtensionConnected] = useState(false);

    useEffect(() => {
        isConnected().then(res => setIsExtensionConnected(res));
    }, []);

    const loginWithFreighter = event => {
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

    const getLoginForm = () => {
        if (!isExtensionConnected) {
            return (
                <Fragment>
                    <p className="LoginPage__form--title browser-support">
                        LOBSTR extension is not installed.
                    </p>
                </Fragment>
            );
        }
        const loginErrorView = renderLoginError();
        return (
            <form onSubmit={loginWithFreighter}>
                <div className="LoginPage__submitWrap">
                    {loginErrorView}
                    <AcceptTerms loginButtonText={'Log in with LOBSTR Signer Extension'} />
                </div>
            </form>
        );
    };

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getLoginForm()}</div>
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
                            <span className="LoginPage__intro">Use StellarTerm with your LOBSTR extension</span>
                        </div>
                        <img src={images['lobstr-logo-black']} alt="lobstr" height="66" />
                    </div>
                    <div className="LoginPage__greenBox">
                        {getLoginForm()}
                    </div>
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
