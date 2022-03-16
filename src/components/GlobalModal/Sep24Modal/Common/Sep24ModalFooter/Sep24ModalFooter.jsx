import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../../lib/driver/Driver';
import ErrorHandler from '../../../../../lib/helpers/ErrorHandler';
import images from '../../../../../images';
import Validate from '../../../../../lib/helpers/Validate';
import { AUTH_TYPE, TX_STATUS } from '../../../../../lib/constants/sessionConstants';

export default class Sep24ModalFooter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPending: false,
            isError: false,
            errorMsg: '',
        };
    }

    onClickWithdrawDone() {
        const { asset, transaction } = this.props;
        const isDeposit = transaction.kind === 'deposit';

        this.getNewModal({
            asset,
            isDeposit,
            transaction,
            noActionBtn: true,
            transferServer: this.props.transferServer,
        });
    }

    getNewModal(dataToModal) {
        const { d } = this.props;

        d.modal.handlers.finish();

        setTimeout(() => {
            d.modal.handlers.activate('Sep24Modal', dataToModal);
        }, 500);
    }

    getActionButtons() {
        const {
            d,
            isDeposit,
            isLoading,
            isAnyError,
            transaction,
            withdrawCompleted,
            noActionBtn,
            windowClosed,
        } = this.props;
        const { isPending } = this.state;

        const cancelBtnText =
            transaction && (transaction.status === 'pending_user_transfer_start' || transaction.status === 'completed')
                ? 'Close'
                : 'Cancel';

        const cancelButton = (
            <button
                className="s-btn_cancel"
                disabled={isPending}
                onClick={() => {
                    window.history.pushState({}, null, '/');
                    d.modal.handlers.cancel();
                }}
            >
                {cancelBtnText}
            </button>
        );

        const finishButton = (
            <button className="s-button" onClick={() => d.modal.handlers.finish()}>
                Done
            </button>
        );

        if (isLoading || isAnyError || noActionBtn) {
            return <div className="Action_buttons">{cancelButton}</div>;
        }

        if (withdrawCompleted) {
            return (
                <div className="Action_buttons">
                    <button className="s-btn_cancel" onClick={() => this.onClickWithdrawDone()}>
                        Back to details
                    </button>
                </div>
            );
        }

        const isInfoNeeded = transaction.type === 'interactive_customer_info_needed';
        const transactionUrl = isInfoNeeded ? `${transaction.url}&callback=postMessage` : false;
        const isWaitingForWithdraw = !isDeposit && transaction.status === 'pending_user_transfer_start';
        const isCompleted = transaction.status === 'completed';

        if (isWaitingForWithdraw) {
            return (
                <div className="Action_buttons">
                    {cancelButton}

                    <button
                        className="s-button"
                        disabled={isAnyError || isLoading || isPending}
                        onClick={() => this.sendWithdrawAsset()}
                    >
                        {isPending ? <div className="nk-spinner" /> : 'Withdraw'}
                    </button>
                </div>
            );
        }

        return isCompleted ? (
            <div className="Action_buttons">{finishButton}</div>
        ) : (
            <div className="Action_buttons">
                {cancelButton}

                {transactionUrl ? (
                    <button className="s-button" onClick={() => this.props.openAnchorWindow()}>
                        {windowClosed ? 'Retry' : 'Continue'}
                    </button>
                ) : null}
            </div>
        );
    }

    async sendWithdrawAsset() {
        this.setState({ isPending: true, isError: false, errorMsg: '' });

        const { d, asset, transaction } = this.props;
        const memoType = transaction.withdraw_memo_type && `MEMO_${transaction.withdraw_memo_type.toUpperCase()}`;
        let memo = transaction.withdraw_memo && transaction.withdraw_memo.toString();

        let type = memoType || 'MEMO_TEXT';
        if (type.toUpperCase() !== type) {
            type = `MEMO_${type.toUpperCase()}`;
        }

        // If returned base64 memo, encode it to stellar memo (BRL token)
        if (memoType === 'MEMO_HASH' && Validate.isBase64(memo)) {
            const buff = Buffer.from(memo, 'base64');
            memo = buff.toString('hex');
        }

        const sendOpts = {
            destination: transaction.withdraw_anchor_account,
            asset: new StellarSdk.Asset(asset.code, asset.issuer),
            amount: transaction.amount_in,
        };

        const sendMemo = memo
            ? {
                type,
                content: memo,
            }
            : undefined;

        if (d.session.authType === AUTH_TYPE.LEDGER) {
            d.modal.handlers.finish();
            d.modal.nextModalName = 'Sep24Modal';
            d.modal.nextModalData = {
                asset,
                amount: transaction.amount_in,
                isDeposit: false,
                withdrawCompleted: true,
                transaction,
                transferServer: this.props.transferServer,
            };
            d.session.handlers.send(sendOpts, sendMemo);
            return null;
        }

        const bssResult = await d.session.handlers.send(sendOpts, sendMemo);

        if (bssResult.status === TX_STATUS.AWAIT_SIGNERS) {
            d.modal.handlers.cancel();
            window.history.pushState({}, null, '/');
        }

        if (bssResult.status === TX_STATUS.FINISH) {
            try {
                await bssResult.serverResult;

                this.setState({
                    isPending: false,
                });

                this.getNewModal({
                    asset,
                    amount: transaction.amount_in,
                    isDeposit: false,
                    withdrawCompleted: true,
                    transaction,
                    transferServer: this.props.transferServer,
                });
            } catch (e) {
                this.setState({
                    isPending: false,
                    isError: true,
                    errorMsg: ErrorHandler(e),
                });
            }
        }
        return null;
    }

    render() {
        const { transferServer } = this.props;
        const { isError, errorMsg } = this.state;

        return (
            <React.Fragment>
                {isError ? (
                    <div className="content_error">
                        <div className="sep24_requestError">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{errorMsg}</span>
                        </div>
                    </div>
                ) : null}

                <div className="Modal_footer">
                    <div className="transaction_support">
                        {transferServer.SUPPORT && (
                            <React.Fragment>
                                <span>Having issues with your transaction?</span>
                                <span>
                                    Contact anchor support at{' '}
                                    <a
                                        href={`mailto:${transferServer.SUPPORT}`}
                                        target="_blank"
                                        rel="nofollow noopener noreferrer"
                                    >
                                        {transferServer.SUPPORT}
                                    </a>
                                </span>
                            </React.Fragment>
                        )}
                    </div>

                    {this.getActionButtons()}
                </div>
            </React.Fragment>
        );
    }
}

Sep24ModalFooter.propTypes = {
    asset: PropTypes.objectOf(PropTypes.any).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    isDeposit: PropTypes.bool.isRequired,
    isAnyError: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    withdrawCompleted: PropTypes.bool,
    noActionBtn: PropTypes.bool,
    windowClosed: PropTypes.bool,
    transaction: PropTypes.objectOf(PropTypes.any),
    openAnchorWindow: PropTypes.func,
    transferServer: PropTypes.objectOf(PropTypes.any),
};
