import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import MagicSpoon from '../../../../lib/MagicSpoon';
import ErrorHandler from './../../../../lib/ErrorHandler';
import AccountModalBlock from '../AccountModalBlock/AccountModalBlock';
import TransactionAuthorBlock from '../TransactionAuthorBlock/TransactionAuthorBlock';
import Ellipsis from '../../../Common/Ellipsis/Ellipsis';
import AssetCardInRow from '../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';

const images = require('./../../../../images');

export default class Sep7PayModal extends React.Component {
    static getPaymentDetails(txDetails) {
        if (txDetails.operation === 'pay') {
            const { assetCode, assetIssuer, amount, destination, memo, memoType } = txDetails;
            const asset = (assetCode && assetIssuer) ?
                new StellarSdk.Asset(assetCode, assetIssuer) :
                StellarSdk.Asset.native();
            return {
                asset,
                amount,
                destination,
                memo,
                memoType,
            };
        }
        const { xdr } = txDetails;
        const tx = new StellarSdk.Transaction(xdr);
        const { type, value } = StellarSdk.Memo.fromXDRObject(tx._memo);
        const memoType = type && `MEMO_${type.toUpperCase()}`;
        const memo = value && value.toString();
        const [operation] = tx.operations;
        return Object.assign({}, operation, { memoType, memo });
    }

    constructor(props) {
        super(props);
        this.state = {
            error: '',
            pending: false,
        };
        this.listenId = this.props.d.session.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.props.d.session.event.unlisten(this.listenId);
    }

    getButtons(asset, destination, amount, memoType, memo) {
        const { submit, d } = this.props;
        const { state } = d.session;
        if (state !== 'in') {
            return null;
        }
        return (
            <div className="Modal_button-block">
                <button
                    className="cancel-button"
                    onClick={() => {
                        window.history.pushState({}, null, '/');
                        submit.cancel();
                    }}>
                    Cancel
                </button>
                <button
                    disabled={this.state.pending}
                    onClick={() => this.handlePayment(asset, destination, amount, memoType, memo)}
                    className="s-button">
                    Confirm{this.state.pending && <Ellipsis />}
                </button>
            </div>
        );
    }

    async handlePayment(asset, destination, amount, memoType, memo) {
        this.setState({ pending: true });
        const { d, submit } = this.props;

        if (d.session.authType === 'ledger') {
            submit.cancel();
        }

        let type = memoType || 'MEMO_TEXT';
        if (type.toUpperCase() !== type) {
            type = `MEMO_${type.toUpperCase()}`;
        }

        const tx = await MagicSpoon.buildTxSendPayment(d.Server, d.session.account, {
            destination,
            asset,
            amount,
            memo: (memo) ? {
                type,
                content: memo,
            } : undefined,
        });
        const bssResult = await d.session.handlers.buildSignSubmit(tx);
        if (bssResult.status === 'await_signers') {
            submit.cancel();
            window.history.pushState({}, null, '/');
        }
        if (bssResult.status === 'finish') {
            bssResult.serverResult
                .then(() => {
                    submit.cancel();
                    window.history.pushState({}, null, '/');
                })
                .catch((e) => {
                    this.setState({
                        error: e,
                        pending: false,
                    });
                });
        }
    }

    render() {
        const { submit, txDetails, d } = this.props;
        const { state, account } = d.session;
        const { originDomain } = txDetails;

        const { asset, amount, destination, memo, memoType } = this.constructor.getPaymentDetails(txDetails);

        const balance = account && (asset.isNative() ? account.maxLumenSpend() : account.getBalance(asset));
        const available = state !== 'in' ?
            'Login required' :
            `${(Math.floor((balance - account.getReservedBalance(asset)) * 10000000) / 10000000).toFixed(7)} ${asset.code}`;
        const buttons = this.getButtons(asset, destination, amount, memoType, memo);
        const { error } = this.state;

        return (
            <div className="Sep7PayModal">
                <div className="Modal_header">
                    <span>New payment</span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => {
                            submit.cancel();
                            window.history.pushState({}, null, '/');
                        }} />
                </div>
                <div className="Sep7PayModal_content">
                    <div className="Sep7PayModal_details">
                        <div className="Sep7PayModal_details_item">
                            <span>Amount</span>
                            <span>{amount} {asset.code}</span>
                        </div>
                        <div className="Sep7PayModal_details_item">
                            <span>Asset</span>
                            <AssetCardInRow code={asset.code} issuer={asset.issuer} d={d} />
                        </div>
                        <div className="Sep7PayModal_details_item">
                            <span>Available</span>
                            <span>{available}</span>
                        </div>
                    </div>
                    <div className="Sep7PayModal_details_item">
                        <span>Recipient</span>
                        <span>{destination}</span>
                    </div>
                    <div className="Sep7PayModal_details_item">
                        <span>Memo</span>
                        <span>{memo || 'No memo'}</span>
                    </div>
                    <TransactionAuthorBlock domain={originDomain} />
                    <AccountModalBlock d={d} />
                    {error &&
                        <div className="Sep7PayModal_error">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{ErrorHandler(error)}</span>
                        </div>}
                    {buttons}
                </div>
            </div>
        );
    }
}
Sep7PayModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    submit: PropTypes.objectOf(PropTypes.func),
    txDetails: PropTypes.objectOf(PropTypes.any),
};
