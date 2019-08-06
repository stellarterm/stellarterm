import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import directory from 'stellarterm-directory';
import Ellipsis from '../../Ellipsis/Ellipsis';
import Driver from '../../../../lib/Driver';
import ErrorHandler from '../../../../lib/ErrorHandler';

export default class TrustButton extends React.Component {
    static goToLink(e) {
        e.stopPropagation();
        // e.preventDefault();
    }

    constructor(props) {
        super(props);
        this.state = {
            status: 'ready', // ready, error, or pending
            errorType: '', // 'unknown' | 'lowReserve'
        };
    }

    handleSubmitTrust(event) {
        event.preventDefault();
        if (this.props.d.session.authType === 'ledger') {
            this.addDataToLocalStorage();
        }
        this.props.d.session.handlers
            .addTrust(this.props.asset.getCode(), this.props.asset.getIssuer())
            .then((bssResult) => {
                if (bssResult.status === 'await_signers') {
                    this.addDataToLocalStorage();
                }
                if (bssResult.status !== 'finish') {
                    return null;
                }

                this.setState({ status: 'pending' });

                return bssResult.serverResult
                    .then(() => {
                        this.setState({ status: 'ready' });
                        this.addDataToLocalStorage();
                    })
                    .catch((error) => {
                        const { data } = error.response;
                        let errorType = 'unknown';
                        if (data.extras &&
                            data.extras.result_codes.operations &&
                            data.extras.result_codes.operations[0] === 'op_low_reserve') {
                            errorType = 'lowReserve';
                        }
                        console.error('Error: ', ErrorHandler(error));
                        this.setState({
                            status: 'error',
                            errorType,
                        });
                    });
            });
    }

    async addDataToLocalStorage() {
        const { asset, host, currency, color } = this.props;

        // do not write assets from the directory to the localStorage
        const assetFromDirectory = directory.resolveAssetByAccountId(asset.code, asset.issuer);

        if (assetFromDirectory.domain !== 'unknown') {
            return;
        }

        // check if asset already exists in the localStorage
        const unknownAssetsData = JSON.parse(localStorage.getItem('unknownAssetsData')) || [];
        const localStorageHasAsset = unknownAssetsData.find(item => (
            (item.code === asset.code) && (item.issuer === asset.issuer)
        ));

        if (localStorageHasAsset) {
            return;
        }

        // if the asset data does not received as props - load it
        let unknownAsset;
        if (currency && host) {
            unknownAsset = {
                code: asset.code,
                issuer: asset.issuer,
                host,
                currency,
                color,
                time: new Date(),
            };
        } else {
            unknownAsset = await this.props.d.session.handlers.loadUnknownAssetData(asset);
        }

        localStorage.setItem('unknownAssetsData', JSON.stringify([...unknownAssetsData, unknownAsset]));
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
                Accepting asset {this.props.asset.getCode()}
                <Ellipsis />
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
                    Error: Not enough lumens. See the{' '}
                    <Link
                        to="/account/"
                        onClick={e => this.constructor.goToLink(e)}>minimum balance section</Link> for more info
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
        const { message, isManualTrust, asset } = this.props;

        if (message.startsWith('https://')) {
            return (
                <button className="s-button" onClick={() => window.open(message, '_blank')}>
                    {message}
                </button>
            );
        }

        return isManualTrust ? (
            <button className="s-button" disabled>
                {`Already accepted ${asset.getCode()}`}
            </button>
        ) : (
            <span className="AssetRow__exists">{message}</span>
        );
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

        return this.props.isManualTrust ? button : <div className="row__shareOption">{button}</div>;
    }
}

TrustButton.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
    message: PropTypes.string.isRequired,
    trustMessage: PropTypes.string.isRequired,
    isManualTrust: PropTypes.bool,
    host: PropTypes.string,
    color: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
