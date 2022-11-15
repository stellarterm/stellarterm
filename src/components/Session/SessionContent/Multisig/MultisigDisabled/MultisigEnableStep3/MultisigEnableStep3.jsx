import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/driver/Driver';
import Ellipsis from './../../../../../Common/Ellipsis/Ellipsis';
import ErrorHandler from '../../../../../../lib/helpers/ErrorHandler';
import { AUTH_TYPE, TX_STATUS } from '../../../../../../lib/constants/sessionConstants';
import { MULTISIG_PROVIDERS } from '../../../../../../lib/constants/multisigConstants';

const images = require('../../../../../../images');


export default class MultisigEnableStep3 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addingError: '',
            pending: false,
        };
    }

    async addSigner(signerData, d) {
        const { publicKey, provider } = signerData;
        const { authType } = d.session;
        this.setState({
            pending: true,
            addingError: '',
        });
        if (authType === AUTH_TYPE.LEDGER) {
            this.props.submit.cancel();
        }
        try {
            const result =
                d.multisig.isMultisigEnabled ?
                    await d.multisig.addSigner(publicKey) :
                    await d.multisig.enableMultisig(publicKey, provider);
            if (result.status === TX_STATUS.FINISH && provider === MULTISIG_PROVIDERS.STELLAR_GUARD) {
                result.serverResult.then(() => {
                    d.multisig.activateGuardSigner();
                });
            }
            if (authType === AUTH_TYPE.WALLET_CONNECT) {
                return;
            }
            if (d.multisig.isMultisigEnabled) {
                this.props.submit.cancel();
                return;
            }
            await result.serverResult;
            this.props.submit.cancel();
        } catch (error) {
            const errorMessage = ErrorHandler(error);
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
                        Be careful! If you lose access to your signer account, you will not be able to use
                        your signed Stellar account.
                    </span>
                </div>
                <div className="Modal_button-block">
                    <button
                        className="cancel-button"
                        disabled={pending}
                        onClick={() => submit.cancel()}
                    >
                            Cancel
                    </button>
                    <button
                        className="s-button"
                        disabled={pending}
                        onClick={() => this.addSigner(signerData, d)}
                    >
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

