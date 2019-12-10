import React from 'react';
import PropTypes from 'prop-types';
import directory from 'stellarterm-directory';
import Driver from '../../../../../lib/Driver';
import MagicSpoon from '../../../../../lib/MagicSpoon';
import ErrorHandler from '../../../../../lib/ErrorHandler';
import images from '../../../../../images';

export default class Sep6ModalFooter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isPending: false,
            isError: false,
            neededKyc: false,
            errorMsg: '',
        };
    }

    onClickConfirm() {
        const { withdrawRequest, asset, isDeposit, requestParams } = this.props;
        this.setState({ isPending: true, isError: false, errorMsg: '' });

        withdrawRequest().then((res) => {
            const kycStatusTypes = new Set(['denied', 'pending']);
            const isInteractive = res.type === 'interactive_customer_info_needed';
            const isKycError = kycStatusTypes.has(res.status) && res.type === 'customer_info_status';

            if (isInteractive || isKycError) {
                this.setState({ neededKyc: true, isPending: false });
            } else if (this.props.isAnyError) {
                this.setState({ isPending: false });
            } else {
                this.getNewModal({
                    asset,
                    isDeposit,
                    isConfirm: true,
                    confirmData: Object.assign(res, requestParams),
                });
            }
        });
    }

    getNewModal(dataToModal) {
        const { d } = this.props;

        d.modal.handlers.finish();

        setTimeout(() => {
            d.modal.handlers.activate('Sep6Modal', dataToModal);
        }, 500);
    }

    getActionButtonText() {
        const { isDeposit, needConfirm } = this.props;
        const { isError } = this.state;
        const btnText = isDeposit ? 'Deposit' : 'Withdraw';

        if (needConfirm) {
            return 'Confirm';
        } else if (isError) {
            return 'Retry';
        }
        return btnText;
    }

    getActionButtons() {
        const { d, isDeposit, isLoading, isAnyError, needConfirm, withdrawCompleted, emptyDeposit } = this.props;
        const { isPending, neededKyc } = this.state;

        const needToHideActionBtn = (isDeposit && emptyDeposit) || (isDeposit && needConfirm);
        const confirmFunction = needConfirm ? () => this.sendWithdrawAsset() : () => this.onClickConfirm();
        const confirmButtonText = this.getActionButtonText();

        return withdrawCompleted ? (
            <div className="Action_buttons">
                <button className="s-button" onClick={() => d.modal.handlers.finish()}>
                    OK
                </button>
            </div>
        ) : (
            <div className="Action_buttons">
                <button
                    className="btn_cancel"
                    disabled={isLoading || isPending}
                    onClick={() => {
                        window.history.pushState({}, null, '/');
                        d.modal.handlers.cancel();
                    }}>
                    Cancel
                </button>

                {needToHideActionBtn ? null : (
                    <button
                        className="s-button"
                        disabled={isAnyError || isLoading || neededKyc}
                        onClick={confirmFunction}>
                        {isPending ? <div className="nk-spinner" /> : confirmButtonText}
                    </button>
                )}
            </div>
        );
    }

    async sendWithdrawAsset() {
        this.setState({ isPending: true, isError: false, errorMsg: '' });

        const { d, asset, sendData } = this.props;
        const memoType = sendData.memo_type && `MEMO_${sendData.memo_type.toUpperCase()}`;
        const memo = sendData.memo && sendData.memo.toString();

        let type = memoType || 'MEMO_TEXT';
        if (type.toUpperCase() !== type) {
            type = `MEMO_${type.toUpperCase()}`;
        }

        const tx = await MagicSpoon.buildTxSendPayment(d.Server, d.session.account, {
            destination: sendData.account_id,
            asset: new StellarSdk.Asset(asset.code, asset.issuer),
            amount: sendData.amount,
            memo: memo
                ? {
                    type,
                    content: memo,
                }
                : undefined,
        });

        if (d.session.authType === 'ledger') {
            d.modal.handlers.finish();
            d.modal.nextModalName = 'Sep6Modal';
            d.modal.nextModalData = {
                asset,
                amount: sendData.amount,
                isDeposit: false,
                isConfirm: false,
                withdrawCompleted: true,
            };
            d.session.handlers.buildSignSubmit(tx);
            return null;
        }

        const bssResult = await d.session.handlers.buildSignSubmit(tx);
        if (bssResult.status === 'await_signers') {
            d.modal.handlers.cancel();
            window.history.pushState({}, null, '/');
        }

        if (bssResult.status === 'finish') {
            bssResult.serverResult
                .then(() => {
                    this.setState({
                        isPending: false,
                    });

                    this.getNewModal({
                        asset,
                        amount: sendData.amount,
                        isDeposit: false,
                        isConfirm: false,
                        withdrawCompleted: true,
                    });
                })
                .catch((e) => {
                    this.setState({
                        isPending: false,
                        isError: true,
                        errorMsg: ErrorHandler(e),
                    });
                });
        }
        return null;
    }

    render() {
        const { asset } = this.props;
        const { isError, errorMsg } = this.state;
        const selectedAnchor = directory.getAnchor(asset.domain);
        const supportMail = selectedAnchor.support;

        return (
            <React.Fragment>
                {isError ? (
                    <div className="content_error">
                        <div className="sep6_requestError">
                            <img src={images['icon-circle-fail']} alt="fail" />
                            <span>{errorMsg}</span>
                        </div>
                    </div>
                ) : null}

                <div className="Modal_footer">
                    <div className="transaction_support">
                        <span>Having issues with your transaction?</span>
                        <span>
                            Contact anchor support at{' '}
                            <a href={`mailto:${supportMail}`} target="_blank" rel="nofollow noopener noreferrer">
                                {supportMail}
                            </a>
                        </span>
                    </div>

                    {this.getActionButtons()}
                </div>
            </React.Fragment>
        );
    }
}

Sep6ModalFooter.propTypes = {
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    isDeposit: PropTypes.bool.isRequired,
    isAnyError: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    withdrawRequest: PropTypes.func,
    requestParams: PropTypes.objectOf(PropTypes.any),
    sendData: PropTypes.objectOf(PropTypes.any),
    needConfirm: PropTypes.bool,
    emptyDeposit: PropTypes.bool,
    withdrawCompleted: PropTypes.bool,
};
