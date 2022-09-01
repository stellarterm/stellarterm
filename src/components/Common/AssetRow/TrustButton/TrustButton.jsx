import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../lib/Driver';
import ErrorHandler from '../../../../lib/ErrorHandler';
import images from '../../../../images';
import { TX_STATUS } from '../../../../lib/constants';

export default class TrustButton extends React.Component {
    static goToLink(e) {
        e.stopPropagation();
        // e.preventDefault();
    }

    static renderPendingButton() {
        return (
            <div className="TrustButton_accept">
                <img
                    src={images['icon-circle-preloader-gif']}
                    width="20"
                    height="20"
                    alt="load"
                />
            </div>
        );
    }

    constructor(props) {
        super(props);
        this.state = {
            status: 'ready', // ready, error, or pending
            errorType: '', // 'unknown' | 'lowReserve'
            errorMessage: '',
        };
    }

    handleSubmitTrust(event) {
        event.preventDefault();
        this.props.d.session.handlers
            .addTrust(this.props.asset.getCode(), this.props.asset.getIssuer())
            .then(({ status, serverResult }) => {
                if (status !== TX_STATUS.FINISH) {
                    return null;
                }

                this.setState({ status: 'pending' });

                return serverResult
                    .then(() => {
                        this.setState({ status: 'ready' });
                    })
                    .catch(error => {
                        const { response } = error;
                        const { data } = response || '';
                        let errorType = 'unknown';
                        if (data && data.extras &&
                            data.extras.result_codes.operations &&
                            data.extras.result_codes.operations[0] === 'op_low_reserve') {
                            errorType = 'lowReserve';
                        }
                        this.setState({
                            status: 'error',
                            errorType,
                            errorMessage: ErrorHandler(error),
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

    renderAcceptButton() {
        return (
            <div className="TrustButton_accept" onClick={event => this.handleSubmitTrust(event)}>
                <span className="TrustButton_accept-icon">+</span>
                <span>ACCEPT</span>
            </div>
        );
    }

    renderErrorButton() {
        let errorPopup = <span>{this.state.errorMessage}</span>;
        if (this.state.errorType === 'lowReserve') {
            errorPopup =
                (<span>
                    Not enough lumens. See the{' '}
                    <Link to="/account#reserved" onClick={e => this.constructor.goToLink(e)}>
                        minimum balance section
                    </Link>
                </span>);
        }
        return (
            <div className="TrustButton_accept error" onClick={event => this.handleSubmitTrust(event)}>
                <div className="TrustButton_error-popup">{errorPopup}</div>
                <span className="TrustButton_accept-icon">+</span>
                <span>FAILED</span>
            </div>
        );
    }

    renderUrlButton() {
        const { message } = this.props;

        if (message.startsWith('https://')) {
            return (
                <button className="s-button" onClick={() => window.open(message, '_blank')}>
                    {message}
                </button>
            );
        }

        return (
            <span className="AssetRow__exists">{message}</span>
        );
    }

    render() {
        let button;
        const assetAccepted = this.checkAssetForAccept();

        if (this.state.status === 'pending') {
            button = this.constructor.renderPendingButton();
        } else if (this.state.status === 'error') {
            button = this.renderErrorButton();
        } else if (assetAccepted) {
            button = this.renderUrlButton();
        } else {
            button = this.renderAcceptButton();
        }

        return button;
    }
}

TrustButton.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
    message: PropTypes.string.isRequired,
};
