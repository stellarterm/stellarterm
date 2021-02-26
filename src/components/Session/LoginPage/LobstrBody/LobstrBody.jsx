import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import HiddenDescription from '../Common/HiddenDescription';
import SecretPhrase from '../SecretPhrase/SecretPhrase';
import Driver from '../../../../lib/Driver';
import AcceptTerms from '../Common/AcceptTerms';


const LobstrBody = ({ history, d, modal }) => {
    const loginWithLobstr = (e) => {
        e.preventDefault();

        d.session.handlers.loginWithLobstr();
    };

    const getLobstrLoginForm = () => (
        <form onSubmit={loginWithLobstr}>
            <div className="LoginPage__submitWrap">

                <AcceptTerms loginButtonText={'Sign in with Lobstr'} />
            </div>
        </form>
    );

    if (modal) {
        return (
            <div className="LoginPage__body LoginPage__popup">
                <div className="LoginPage__greenBox">{getLobstrLoginForm()}</div>
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
                            <span className="LoginPage__intro">Use StellarTerm with your Lobstr app</span>
                        </div>
                        <img src={images['lobstr-logo']} alt="lobstr" height="30" />
                    </div>
                    <div className="LoginPage__greenBox">
                        {getLobstrLoginForm()}
                    </div>
                </div>
                <SecretPhrase d={d} />
            </div>
        </React.Fragment>
    );
};

export default LobstrBody;

LobstrBody.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    history: PropTypes.objectOf(PropTypes.any),
    modal: PropTypes.bool,
};
