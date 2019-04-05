import React from 'react';
import PropTypes from 'prop-types';
import Generic from '../../../Generic';
import ErrorBoundary from '../../../ErrorBoundary';
import AccountView from './AccountView/AccountView';
import Driver from '../../../../lib/Driver';
import Federation from './Federation/Federation';
import AccountIdBlock from '../../AccountIdBlock/AccountIdBlock';

export default function SessionAccount(props) {
    const accountID = props.d.session.account.accountId();

    return (
        <ErrorBoundary>
            <Generic>
                <AccountIdBlock accountID={accountID} />
                <p className="AccountView_text">
                    To receive payments, share your account ID with them (begins with a G) or scan QR-code.
                </p>

                <Federation d={props.d} />
            </Generic>
            <Generic noTopPadding>
                <h2>Where is the money stored?</h2>
                <p>
                    In the Stellar network, funds exist on the network and can only be moved by whoever has the secret
                    key. This means that your secret key is extremely sensitive, and whoever has access to it can move
                    the funds. However, money is <strong>NOT</strong> actually <em>{'"inside"'}</em> StellarTerm.
                    StellarTerm is just a helpful tool that helps you use your secret key to make transactions.
                </p>

                <p>
                    <strong>WARNING</strong>: Be extremely careful with your secret key and do not share it with
                    anybody.
                </p>
            </Generic>
            <AccountView d={props.d} />
        </ErrorBoundary>
    );
}

SessionAccount.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
