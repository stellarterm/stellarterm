import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Driver from '../../../lib/Driver';
import TransactionDetails from '../TransactionDetails/TransactionDetails';

export default class GlobalModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = { errorMsg: null, result: null };

        this.unsubModal = this.props.d.modal.event.sub(() => {
            this.forceUpdate();
        });

        this.unsubSession = this.props.d.session.event.sub(() => {
            this.forceUpdate();
        });

        this.sendTransactionToLedger = this.sendTransactionToLedger.bind(this);
    }

    componentDidMount() {
        this.sendTransactionToLedger();
    }

    componentWillUnmount() {
        this.unsubModal();
        this.unsubSession();
    }

    getTransactionStatus() {
        const d = this.props.d;
        const { errorMsg, result } = this.state;
        const waitingForConfirm = errorMsg === null;
        const waitingForHorizon = result !== null;
        const isSuccess = d.modal.txStatus === true;
        const isAnyError = errorMsg || d.modal.txStatus === 'error';

        return (
            <div className="LedgerPopup_footer">
                {isSuccess ? (
                    <React.Fragment>
                        <div className="Footer_transaction">
                            <img src={images['icon-circle-success']} alt="preloader" /> Transaction success!
                        </div>
                        <div className="Action_buttons">
                            <button
                                className="s-button"
                                onClick={() => {
                                    d.modal.handlers.ledgerFinish('close');
                                }}>
                                <span>OK</span>
                            </button>
                        </div>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <div className="Footer_transaction">
                            {waitingForConfirm && !isAnyError ? (
                                <React.Fragment>
                                    <img src={images['icon-circle-preloader-gif']} alt="preloader" />{' '}
                                    {waitingForHorizon ? (
                                        <span>Waiting for Horizon answer.</span>
                                    ) : (
                                        <span>Waiting for transaction sign on Ledger.</span>
                                    )}
                                </React.Fragment>
                            ) : null}

                            {isAnyError ? (
                                <React.Fragment>
                                    <img src={images['icon-circle-fail']} alt="preloader" />{' '}
                                    <span>{d.modal.txStatus === 'error' ? 'Transaction failed!' : errorMsg}</span>
                                </React.Fragment>
                            ) : null}
                        </div>

                        <div className="Action_buttons">
                            {waitingForConfirm || waitingForHorizon || isAnyError ? (
                                <button
                                    className="btn_cancel"
                                    onClick={() => {
                                        d.modal.handlers.cancel();
                                    }}>
                                    Cancel
                                </button>
                            ) : null}
                        </div>
                    </React.Fragment>
                )}
            </div>
        );
    }

    sendTransactionToLedger() {
        const d = this.props.d;
        this.setState({ errorMsg: null, result: null });

        d.session.account
            .signWithLedger(d.modal.inputData)
            .then((result) => {
                this.setState({ result });
                d.modal.handlers.waitLedger(result);
            })
            .catch((error) => {
                let errorMsg = error.message;
                switch (errorMsg) {
                case 'Failed to sign with Ledger device: U2F TIMEOUT':
                    errorMsg = 'Time out to sign by Ledger.';
                    break;
                case 'Transaction approval request was rejected':
                    d.modal.handlers.cancel(error.message);
                    break;
                default:
                    break;
                }

                this.setState({
                    errorMsg,
                });
            });
    }

    render() {
        const d = this.props.d;
        const transactionStatus = this.getTransactionStatus();

        return (
            <div className="GlobalModal">
                <div className="GlobalModal__header">Sign transaction with your Ledger</div>

                <div className="LedgerPopup">
                    <div className="LedgerPopup_header">
                        <img src={images['ledger-logo']} className="img--noSelect" alt="Ledger Logo" />
                        <p>Confirm transaction on your Ledger device</p>
                    </div>
                    <TransactionDetails tx={d.modal.inputData} />

                    {transactionStatus}
                </div>
            </div>
        );
    }
}

GlobalModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
