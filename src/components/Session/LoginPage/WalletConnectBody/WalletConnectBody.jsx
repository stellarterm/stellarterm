import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/Driver';
import AcceptTerms from '../Common/AcceptTerms';


const WalletConnectBody = ({ history, d, modal }) => {
    const loginWithWalletConnect = (e) => {
        e.preventDefault();

        d.session.handlers.loginWithWalletConnect();
    };

    const getWalletConnectLoginForm = () => (
        <form onSubmit={loginWithWalletConnect}>
            <div className="LoginPage__submitWrap">

                <AcceptTerms loginButtonText={'Sign in'} />
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
                            alt="<" />
                        <HiddenDescription />
                    </div>
                    <div className="LoginPage__header">
                        <div className="LoginPage__header-wrap">
                            <span className="LoginPage__title">Access your account</span>
                            <span className="LoginPage__intro">Use StellarTerm with Wallet Connect supported app</span>
                        </div>
                        <div>
                            <img src={images['walletconnect-logo']} alt="wc" height="20" />
                            <span style={{ fontSize: 30, fontWeight: 'bold', marginLeft: 10 }}>Wallet Connect</span>
                        </div>
                    </div>
                    <div className="LoginPage__greenBox">
                        {getWalletConnectLoginForm()}
                    </div>
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
