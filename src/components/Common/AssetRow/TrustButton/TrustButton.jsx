import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import directory from 'stellarterm-directory';
import Driver from '../../../../lib/Driver';
import ErrorHandler from '../../../../lib/ErrorHandler';
import images from '../../../../images';

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
                    alt="load" />
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
                        this.setState({
                            status: 'error',
                            errorType,
                            errorMessage: ErrorHandler(error),
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
                    <Link to="/account/" onClick={e => this.constructor.goToLink(e)}>
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
    host: PropTypes.string,
    color: PropTypes.string,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
};
