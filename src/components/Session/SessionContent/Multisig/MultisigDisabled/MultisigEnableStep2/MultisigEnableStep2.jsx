import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import Driver from '../../../../../../lib/driver/Driver';
import Multisig from '../../../../../../lib/driver/driverInstances/Multisig';
import { KEY_NAMES, MULTISIG_PROVIDERS } from '../../../../../../lib/constants/multisigConstants';

const images = require('../../../../../../images');

export default class MultisigEnableStep2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            publicKey: '',
            valid: false,
            inputError: '',
            isUpdated: false,
            provider: null,
            checkProviderLoading: false,
        };
    }

    handleInput(e) {
        e.preventDefault();
        this.setState({
            publicKey: e.target.value,
            valid: StellarSdk.StrKey.isValidEd25519PublicKey(e.target.value),
            inputError: '',
            isUpdated: false,
            provider: null,
        }, () => this.checkKey());
    }

    goBack() {
        const { submit, d } = this.props;
        submit.cancel();
        if (d.session.account.signers.length === 1) {
            d.modal.handlers.activate('multisigEnableStep1', d);
        }
    }

    checkKey() {
        const { publicKey, valid } = this.state;
        if (!publicKey) {
            return;
        }
        if (valid) {
            const keyAlreadyUsed = this.props.d.multisig.signers.find(({ key }) => key === publicKey);

            if (keyAlreadyUsed) {
                this.setState({
                    inputError: 'This key is already a signer',
                });
                return;
            }

            this.setState({ checkProviderLoading: true });

            Multisig.getKeyProvider(publicKey)
                .then(provider => {
                    this.setState({
                        provider,
                        checkProviderLoading: false,
                        isUpdated: true,
                    });
                    if (this.props.d.multisig.isMultisigEnabled && provider !== MULTISIG_PROVIDERS.LOBSTR_VAULT) {
                        this.setState({
                            inputError: 'You can add additional signatures only with the LOBSTR VAULT',
                        });
                    }
                });
        } else {
            this.setState({
                inputError: 'Incorrect Stellar public key',
            });
        }
    }

    async addSigner() {
        const { provider, publicKey } = this.state;

        const signerData = {
            provider,
            publicKey,
        };
        this.props.submit.cancel();
        this.props.d.modal.handlers.activate('multisigEnableStep3', signerData);
    }

    render() {
        const { inputError, publicKey, valid, checkProviderLoading, provider } = this.state;
        return (
            <div className="MultisigEnableStep2">
                <div className="Modal_header">
                    <span>Connect multisig signer</span>
                    <img src={images['icon-close']} alt="X" onClick={() => this.props.submit.cancel()} />
                </div>
                <div className="MultisigEnableStep2_content">
                    <div className="MultisigEnableStep2_content-description">
                        <span>Enter the public key of the account that will co-sign the transactions.</span>
                        <span>Copy this from LOBSTR Vault or your multisig provider.</span>
                    </div>

                    <div className="MultisigEnableStep2_input">
                        <label htmlFor="signerkey">Signer public key</label>
                        <input
                            type="text"
                            id="signerkey"
                            maxLength="56"
                            className={inputError && 'invalid'}
                            value={publicKey}
                            onChange={e => this.handleInput(e)}
                            placeholder="Stellar public key"
                        />

                        {valid && !checkProviderLoading && !inputError &&
                            <span className="MultisigEnableStep2_vault">
                                {provider ? KEY_NAMES.COSIGNER(provider) : KEY_NAMES.CUSTOM}
                            </span>
                        }

                        {inputError &&
                            <span className="MultisigEnableStep2_error">{inputError}</span>}
                    </div>
                </div>
                <div className="Modal_button-block">
                    <button
                        className="cancel-button"
                        onClick={() => this.goBack()}
                    >
                        Back
                    </button>
                    <button
                        disabled={!valid || checkProviderLoading || Boolean(inputError)}
                        className="s-button"
                        onClick={() => this.addSigner()}
                    >Add signer</button>
                </div>
            </div>
        );
    }
}
MultisigEnableStep2.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
};

