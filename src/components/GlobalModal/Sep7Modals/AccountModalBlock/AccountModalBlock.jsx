import React from 'react';
import PropTypes from 'prop-types';
import LoginModalBlock from './LoginModalBlock/LoginModalBlock';
import Ellipsis from '../../../Common/Ellipsis/Ellipsis';
import Driver from '../../../../lib/Driver';

export default function AccountModalBlock(props) {
    const { d } = props;
    const { state, userFederation, account } = d.session;
    const { account_id } = account || '';
    switch (state) {
    case 'in':
        if (userFederation) {
            return (
                <div className="AccountModalBlock_account">
                    <span>You logged as:</span>
                    <span>{userFederation}*stellarterm.com</span>
                </div>
            );
        }
        return (
            <div className="AccountModalBlock_account">
                <span>Your Wallet Account ID:</span>
                <span>{account_id.substr(0, 6)}...{account_id.substr(50, 6)}</span>
            </div>
        );
    case 'unfunded':
        return (
                <div className="AccountModalBlock_unfunded">
                    To use your Stellar account, you must activate it by sending at least 5
                    lumens (XLM) to your account.
                    You can buy lumens (XLM) from an exchange and send them to your address.
                </div>
        );
    case 'out':
        return (<LoginModalBlock d={d} />);
    case 'loading':
        return (
                <div className="AccountModalBlock_loading">
                    Contacting network and loading account<Ellipsis />
                </div>
        );
    default:
        break;
    }
}
AccountModalBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

