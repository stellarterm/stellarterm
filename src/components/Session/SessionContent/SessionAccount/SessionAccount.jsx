import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import Generic from '../../../Common/Generic/Generic';
import AccountIdBlock from '../../AccountIdBlock/AccountIdBlock';
import Federation from './Federation/Federation';
import AccountView from './AccountView/AccountView';
import NewClaimableBalancesBanner from './NewClaimableBalancesBanner/NewClaimableBalancesBanner';

export default function SessionAccount(props) {
    const [hasBanner, setHasBanner] = useState(props.d.claimableBalances.hasBanner);

    useEffect(() => {
        const unlisten = props.d.claimableBalances.event.sub(() => {
            setHasBanner(props.d.claimableBalances.hasBanner);
        });
        return () => unlisten();
    }, []);

    const accountID = props.d.session.account.accountId();

    return (
        <React.Fragment>
            {hasBanner &&
                <Generic>
                    <NewClaimableBalancesBanner d={props.d} />
                </Generic>
            }

            <Generic noTopPadding={hasBanner}>
                <AccountIdBlock accountID={accountID} />
                <p className="AccountView_text">
                    To receive payments, share your account ID with them (begins with a G) or scan QR code.
                </p>

                <Federation d={props.d} />
            </Generic>

            <AccountView d={props.d} />
        </React.Fragment>
    );
}

SessionAccount.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
