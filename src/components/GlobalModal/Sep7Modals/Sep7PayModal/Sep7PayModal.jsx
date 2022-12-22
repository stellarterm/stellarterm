import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../lib/driver/Driver';
import ErrorHandler from '../../../../lib/helpers/ErrorHandler';
import AccountModalBlock from '../AccountModalBlock/AccountModalBlock';
import TransactionAuthorBlock from '../TransactionAuthorBlock/TransactionAuthorBlock';
import Ellipsis from '../../../Common/Ellipsis/Ellipsis';
import AssetCardInRow from '../../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import Sep7GetBuiltTx from '../Sep7GetBuiltTx/Sep7GetBuiltTx';
import { AUTH_TYPE, SESSION_STATE, TX_STATUS } from '../../../../lib/constants/sessionConstants';

const images = require('./../../../../images');

export default class Sep7PayModal extends React.Component {
    static clearUri() {
        window.history.pushState({}, null, '/');
    }

    constructor(props) {
        super(props);
        this.state = {
            error: '',
            pending: false,
        };
        this.unsub = this.props.d.session.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unsub();
    }

    getPaymentDetails(txDetails) {
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
        const { d } = this.props;
        const tx = new StellarSdk.Transaction(xdr, d.Server.networkPassphrase);
        const { type, value } = StellarSdk.Memo.fromXDRObject(tx._memo);
        const memoType = type && `MEMO_${type.toUpperCase()}`;
        const memo = value && value.toString();
        const [operation] = tx.operations;
        return Object.assign({}, operation, { memoType, memo });
    }

    getButtons() {
        const { submit, d } = this.props;
        const { state } = d.session;
        if (state !== SESSION_STATE.IN) {
            return null;
        }
        return (
            <div className="Modal_button-block">
                <button
                    className="cancel-button"
                    onClick={() => {
                        window.history.pushState({}, null, '/');
                        submit.cancel();
                    }}
                >
                    Cancel
                </button>
                <button
                    disabled={this.state.pending}
                    onClick={() => this.handlePayment()}
                    className="s-button"
                >
                    Confirm{this.state.pending && <Ellipsis />}
                </button>
            </div>
        );
    }

    async getBssResult() {
        const { d, txDetails } = this.props;

        const isPay = txDetails.operation === 'pay';

        if (isPay) {
            const { asset, amount, destination, memo, memoType } = this.getPaymentDetails(txDetails);
            let type = memoType || 'MEMO_TEXT';
            if (type.toUpperCase() !== type) {
                type = `MEMO_${type.toUpperCase()}`;
            }

            const sendMemo = (memo) ? {
                type,
                content: memo,
            } : undefined;

            return d.session.handlers.send({
                destination,
                asset,
                amount,
            }, sendMemo);
        }

        const tx = await Sep7GetBuiltTx(txDetails, d);
        return d.session.handlers.signSubmit(tx);
    }

    async handlePayment() {
        const { d, submit } = this.props;

        try {
            this.setState({ pending: true });

            const { authType } = d.session;
            if (authType === AUTH_TYPE.LEDGER) {
                submit.cancel();
            }

            const bssResult = await this.getBssResult();

            if (bssResult.status === TX_STATUS.SENT_TO_WALLET_CONNECT) {
                this.constructor.clearUri();
            }
            if (bssResult.status === TX_STATUS.AWAIT_SIGNERS) {
                submit.cancel();
                this.constructor.clearUri();
            }
            if (bssResult.status === TX_STATUS.FINISH) {
                await bssResult.serverResult;
                submit.cancel();
                this.constructor.clearUri();
            }
        } catch (e) {
            this.setState({
                error: e,
                pending: false,
            });
        }
    }

    render() {
        const { submit, txDetails, d } = this.props;
        const { state, account } = d.session;
        const { originDomain } = txDetails;

        const { asset, amount, destination, memo } = this.getPaymentDetails(txDetails);

        const balance = account && (asset.isNative() ? account.maxLumenSpend() : account.getBalance(asset));
        const available = state !== SESSION_STATE.IN ?
            'Login required' :
            `${(Math.floor((balance - account.getReservedBalance(asset)) * 10000000) / 10000000).toFixed(7)} ${asset.code}`;
        const buttons = this.getButtons();
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
                        }}
                    />
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
                        <div className="ErrorTransactionBlock">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{ErrorHandler(error, 'payment')}</span>
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
