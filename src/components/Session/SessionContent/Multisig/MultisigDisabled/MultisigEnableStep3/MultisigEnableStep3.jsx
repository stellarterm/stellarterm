import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';

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
        const { publicKey, signerProvider } = signerData;
        this.setState({ pending: true });
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
            result.serverResult
                .then(() => this.props.submit.cancel())
                .catch(e => console.log(e));
        } catch (error) {
            this.setState({
                addingError: error,
                pending: false,
            });
        }
    }

    render() {
        const { submit, signerData, d } = this.props;
        const { addingError } = this.state;
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
                    <button className="cancel-button" onClick={() => submit.cancel()}>Cancel</button>
                    <button
                        className="s-button"
                        disabled={this.state.pending}
                        onClick={() => this.addSigner(signerData, d)}>
                        Continue
                    </button>
                </div>
                {addingError && <span>{addingError}</span>}
            </div>
        );
    }
}
MultisigEnableStep3.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
    signerData: PropTypes.objectOf(PropTypes.string),
};

