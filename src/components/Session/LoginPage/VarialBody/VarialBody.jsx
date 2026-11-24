import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isConnected } from '@stellar/varial-sdk';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/driver/Driver';
import AcceptTerms from '../Common/AcceptTerms';


const VarialBody = ({ history, d, modal }) => {
    const [loginError, setLoginError] = useState('');
    const [extensionConnected, setExtensionConnected] = useState(null);

    useEffect(() => {
        let active = true;
        isConnected().then(({ isConnected: connected, error }) => {
            if (active) {
                setExtensionConnected(connected && !error);
                if (error) {
                    setLoginError(error.message || 'Unable to detect the Varial extension.');
                }
            }
        }).catch(error => {
            if (active) {
                setExtensionConnected(false);
                setLoginError(error.message || 'Unable to detect the Varial extension.');
            }
        });
        return () => {
            active = false;
        };
    }, []);

    const loginWithVarial = event => {
        event.preventDefault();
        setLoginError('');
        d.session.handlers.logInWithVarial()
            .catch(error => setLoginError(error.message || String(error)));
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

    const getVarialLoginForm = () => {
        if (extensionConnected === null) {
            return <p className="LoginPage__form--title">Checking for Varial...</p>;
        }
        if (!extensionConnected) {
            return (
                <Fragment>
                    {renderLoginError()}
                    <p className="LoginPage__form--title browser-support">
                        Varial extension is not installed.
                    </p>
                    <a
                        className="LoginPage__link"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        href="https://varialwallet.com/"
                    >
                        Install Varial
                    </a>
                </Fragment>
            );
        }
        const loginErrorView = renderLoginError();
        return (
            <form onSubmit={loginWithVarial}>
                <div className="LoginPage__submitWrap">
                    {loginErrorView}
                    <AcceptTerms loginButtonText={'Log in with Varial'} />
                </div>
            </form>
        );
    };

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getVarialLoginForm()}</div>
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
                            <span className="LoginPage__intro">Use StellarTerm with your Varial extension</span>
                        </div>
                        <img src={images['varial-logo-main']} alt="Varial" height="32" />
                    </div>
                    <div className="LoginPage__greenBox">
                        {getVarialLoginForm()}
                    </div>
                </div>
                <SecretPhrase d={d} />
            </div>
        </React.Fragment>
    );
};

export default VarialBody;

VarialBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
