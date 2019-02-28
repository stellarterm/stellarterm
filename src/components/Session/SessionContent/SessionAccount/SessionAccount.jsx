import React from 'react';
import PropTypes from 'prop-types';

import Generic from '../../../Generic';
import ErrorBoundary from '../../../ErrorBoundary';
import AccountView from './AccountView/AccountView';
import clickToSelect from '../../../../lib/clickToSelect';
import Driver from '../../../../lib/Driver';

export default function SessionAccount(props) {
    return (
        <ErrorBoundary>
            <Generic>
                <div className="s-alert s-alert--primary">
                    <p className="Sesssion__yourId__title">Your Wallet Account ID</p>
                    <strong className="clickToSelect Sesssion__yourId__accountId" onClick={clickToSelect}>
                        {props.d.session.account.accountId()}
                    </strong>
                </div>
                <p>To receive payments, share your account ID with them (begins with a G).</p>
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
