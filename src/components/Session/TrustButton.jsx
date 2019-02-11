import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import Driver from '../../lib/Driver';

export default class TrustButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'ready', // ready, error, or pending
            errorType: '', // 'unknown' | 'lowReserve'
        };
    }

    handleSubmitTrust(event) {
        event.preventDefault();

        this.props.d.session.handlers
            .addTrust(this.props.asset.getCode(), this.props.asset.getIssuer())
            .then((bssResult) => {
                if (bssResult.status !== 'finish') {
                    return null;
                }

                this.setState({ status: 'pending' });

                return bssResult.serverResult
                    .then(() => {
                        this.setState({ status: 'ready' });
                    })
                    .catch((error) => {
                        let errorType = 'unknown';
                        if (error.extras && error.extras.result_codes.operations[0] === 'op_low_reserve') {
                            errorType = 'lowReserve';
                        }

                        this.setState({
                            status: 'error',
                            errorType,
                        });
                    });
            });
    }

    checkAssetForAccept() {
        return _.some(
            this.props.d.session.account.balances,
            balance =>
                balance.asset_code === this.props.asset.getCode() &&
                balance.asset_issuer === this.props.asset.getIssuer(),
        );
    }

    renderPendingButton() {
        return (
            <button className="s-button" disabled onClick={event => this.handleSubmitTrust(event)}>
                Accepting asset {this.props.asset.getCode()}...
            </button>
        );
    }

    renderAcceptButton() {
        return (
            <button className="s-button" onClick={event => this.handleSubmitTrust(event)}>
                {this.props.trustMessage}
            </button>
        );
    }

    renderErrorButton() {
        if (this.state.errorType === 'lowReserve') {
            return (
                <button className="s-button" onClick={event => this.handleSubmitTrust(event)}>
                    Error: Not enough lumens. See the <a href="#account">minimum balance section</a> for more info
                </button>
            );
        }
        return (
            <button className="s-button" onClick={event => this.handleSubmitTrust(event)}>
                Error accepting asset {this.props.asset.getCode()}
            </button>
        );
    }

    renderUrlButton() {
        if (this.props.message.startsWith('https://')) {
            return (
                <button className="s-button" onClick={() => window.open(this.props.message, '_blank')}>
                    {this.props.message}
                </button>
            );
        }
        return <span className="AddTrustRow__exists">{this.props.message}</span>;
    }

    render() {
        let button;
        const assetAccepted = this.checkAssetForAccept();

        if (this.state.status === 'pending') {
            button = this.renderPendingButton();
        } else if (this.state.status === 'error') {
            button = this.renderErrorButton();
        } else if (assetAccepted) {
            button = this.renderUrlButton();
        } else {
            button = this.renderAcceptButton();
        }

        return <div className="row__shareOption">{button}</div>;
    }
}

TrustButton.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
    message: PropTypes.string.isRequired,
    trustMessage: PropTypes.string.isRequired,
};
