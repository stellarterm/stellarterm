import React from 'react';
import PropTypes from 'prop-types';
import createStellarIdenticon from 'stellar-identicon-js';
import Ellipsis from '../../../Common/Ellipsis/Ellipsis';
import Driver from '../../../../lib/Driver';

export default class AccountModalBlock extends React.Component {
    goToLogin() {
        this.props.d.modal.handlers.cancel();
        this.props.d.modal.handlers.activate('LoginModal');
    }
    render() {
        const { d } = this.props;
        const { state, userFederation, account } = d.session;
        // eslint-disable-next-line camelcase
        const { account_id } = account || '';
        switch (state) {
        case 'in': {
            const canvas = createStellarIdenticon(account_id);
            const renderedIcon = canvas.toDataURL();
            if (userFederation) {
                return (
                    <div className="AccountModalBlock_account">
                        <span>Logged in as:</span>
                        <span className="AccountModalBlock_account-id">
                            <img
                                src={renderedIcon} alt="ident" height="14" width="14"
                                className="AccountModalBlock_identicon" />
                            {userFederation}*stellarterm.com
                        </span>
                    </div>
                );
            }
            return (
                <div className="AccountModalBlock_account">
                    <span>Your Wallet Account ID:</span>
                    <span className="AccountModalBlock_account-id">
                        <img src={renderedIcon} alt="ident" height="14" width="14" className="AccountModalBlock_identicon" />
                        {account_id.substr(0, 6)}...{account_id.substr(50, 6)}
                    </span>
                </div>
            );
        }
        case 'out':
            return (
                <div className="AccountModalBlock_out">
                    <span>Please, login to complete transaction</span>
                    <button className="s-button" onClick={() => this.goToLogin()}>Log in</button>
                </div>
            );
        case 'loading':
            return (
                <div className="AccountModalBlock_loading">
                        Contacting network and loading account<Ellipsis />
                </div>
            );
        default:
            return null;
        }
    }
}
AccountModalBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

