import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import Ellipsis from '../../../../../Ellipsis';

export default class RemoveTrustLink extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'ready', // Can be: ready, pending, error
        };
    }

    handleRemoveTrust(e) {
        e.preventDefault();
        const { code, issuer } = this.props.balance;

        this.props.d.session.handlers.removeTrust(code, issuer).then(({ status, serverResult }) => {
            if (status !== 'finish') {
                return null;
            }

            this.setState({ status: 'pending' });
            return serverResult
                .then(res => console.log('Successfully removed trust', res))
                .catch((err) => {
                    console.log('Errored when removing trust', err);
                    this.setState({ status: 'error' });
                });
        });
    }

    render() {
        const { status } = this.state;
        const { account } = this.props.d.session;
        const { balance, code, issuer } = this.props.balance;
        const balanceIsZero = balance === '0.0000000';
        const orderExists = account.isOrderExists(new StellarSdk.Asset(code, issuer));

        if (!balanceIsZero) {
            return <span className="BalancesTable__row__removeLink"> Asset can be removed when balance is 0</span>;
        } else if (orderExists) {
            return <span className="BalancesTable__row__removeLink"> Close all orders to remove asset</span>;
        }

        if (status === 'ready') {
            return (
                <a className="BalancesTable__row__removeLink" onClick={e => this.handleRemoveTrust(e)}>
                    Remove asset
                </a>
            );
        } else if (status === 'pending') {
            return (
                <span className="BalancesTable__row__removeLink">
                    Removing asset
                    <Ellipsis />
                </span>
            );
        }
        return (
            <a className="BalancesTable__row__removeLink" onClick={e => this.handleRemoveTrust(e)}>
                Errored when removing asset
            </a>
        );
    }
}

RemoveTrustLink.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    balance: PropTypes.objectOf(PropTypes.string).isRequired,
    code: PropTypes.string,
    issuer: PropTypes.string,
};
