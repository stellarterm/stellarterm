import React from 'react';
import PropTypes from 'prop-types';

import Driver from '../../../lib/Driver';
import SecurityPhrase from './SecurityPhrase/SecurityPhrase';
import LoginPageBody from './LoginPageBody/LoginPageBody';
import SignUpBody from './SignUpBody/SignUpBody';
import LedgerBody from './LedgerBody/LedgerBody';
import LoginPageTabs from './LoginPageTabs/LoginPageTabs';

export default function LoginPage(props) {
    const rootAddress = props.urlParts[0];
    let pageBody;

    switch (rootAddress) {
    case 'account':
        pageBody = <LoginPageBody d={props.d} />;
        break;
    case 'ledger':
        pageBody = <LedgerBody d={props.d} />;
        break;
    case 'signup':
        pageBody = <SignUpBody />;
        break;
    default:
        break;
    }

    return (
        <React.Fragment>
            <SecurityPhrase />
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="island__header">Access your account</div>

                    <div className="LoginPage">
                        <LoginPageTabs rootAddress={rootAddress} />
                        {pageBody}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

LoginPage.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    urlParts: PropTypes.arrayOf(PropTypes.string),
};
