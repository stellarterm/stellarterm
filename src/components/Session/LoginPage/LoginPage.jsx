import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';
import SignUpBody from './SignUpBody/SignUpBody';
import LedgerBody from './LedgerBody/LedgerBody';
import LoginPageBody from './LoginPageBody/LoginPageBody';
import LedgerLoginLink from './LedgerBody/LedgerLoginLink/LedgerLoginLink';


export default function LoginPage(props) {
    const rootAddress = props.urlParts;
    let pageBody;

    switch (rootAddress) {
    case 'account':
        pageBody = (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="LoginPage">
                        <LoginPageBody d={props.d} />
                    </div>
                </div>
            </div>
        );
        break;
    case 'ledger':
        pageBody = (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="LoginPage">
                        <LedgerBody {...props} d={props.d} />
                    </div>
                </div>
            </div>
        );
        break;
    case 'signup':
        pageBody = <SignUpBody d={props.d} />;
        break;
    default:
        break;
    }

    return (
        <React.Fragment>
            {pageBody}
            {rootAddress === 'account' && <LedgerLoginLink />}
        </React.Fragment>
    );
}

LoginPage.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    urlParts: PropTypes.string,
};
