import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import Ellipsis from './../../../../../Common/Ellipsis/Ellipsis';

const images = require('../../../../../../images');


export default class MultisigEnableStep3 extends React.Component {
    static getErrorType(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (!error.data) {
            return `clientError - ${error.message}`;
        }
        if (!error.data.extras || !error.data.extras.result_codes) {
            return `unknownResponse - ${error.message}`;
        }
        if (!error.data.extras.result_codes.operations) {
            return error.data.extras.result_codes.transaction;
        }

        return error.data.extras.result_codes.operations[0];
    }

    static getErrorMessage(errorType) {
        switch (errorType) {
        case 'tx_bad_seq':
            return 'Transaction failed because sequence got out of sync. Please reload StellarTerm and try again.';
        case 'op_low_reserve':
            return 'Your account does not have enough XLM to meet the minimun balance.';
        case 'op_underfunded':
            return 'Transaction failed due to a lack of funds.';

        default:
            return `Error code: ${errorType}`;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            addingError: '',
            pending: false,
        };
    }

    async addSigner(signerData, d) {
        const { publicKey, signerProvider } = signerData;
        this.setState({
            pending: true,
            addingError: '',
        });
        try {
            const result = await d.session.handlers.addSigner(publicKey, signerProvider);
            if (result.status === 'finish' && signerProvider === 'stellarGuard') {
                result.serverResult.then(() => {
                    d.session.handlers.activateGuardSigner();
                });
            }
            if (d.session.account.signers.length > 1) {
                this.props.submit.cancel();
                return;
            }
            await result.serverResult;
            this.props.submit.cancel();
        } catch (error) {
            const errorType = this.constructor.getErrorType(error);
            const errorMessage = this.constructor.getErrorMessage(errorType);
            this.setState({
                addingError: errorMessage,
                pending: false,
            });
        }
    }

    render() {
        const { submit, signerData, d } = this.props;
        const { addingError, pending } = this.state;
        return (
            <div className="MultisigEnableStep3">
                <div className="Modal_header">
                    <span>Add signer to your Stellar account?</span>
                    <img src={images['icon-close']} alt="X" onClick={() => submit.cancel()} />
                </div>
                <div className="MultisigEnableStep3_content">
                    <span>
                        After adding new signer you’ll need to confirm all the transactions with your new signer
                        account. You will need to confirm payments, adding, removing, trading assets etc.
                    </span>
                    <span className="MultisigEnableStep3_content-alert">
                        Be careful! If you will lose access to your signer account, you will not be able to use
                        your signed Stellar account.
                    </span>
                </div>
                <div className="Modal_button-block">
                    <button
                        className="cancel-button"
                        disabled={pending}
                        onClick={() => submit.cancel()}>
                            Cancel
                    </button>
                    <button
                        className="s-button"
                        disabled={pending}
                        onClick={() => this.addSigner(signerData, d)}>
                            Continue{pending && <Ellipsis />}
                    </button>
                </div>
                {addingError && <span className="MultisigEnableStep3_error">{addingError}</span>}
            </div>
        );
    }
}
MultisigEnableStep3.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
    signerData: PropTypes.objectOf(PropTypes.string),
};

