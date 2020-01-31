import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../../../../lib/Driver';

const images = require('../../../../../../images');

export default class MultisigEnableStep2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            publicKey: '',
            valid: false,
            isVaultKey: undefined,
            isGuardKey: 'noChoosed',
            inputError: '',
            selectError: '',
            isUpdated: false,
            isOpenSelect: false,
        };
    }

    componentDidUpdate(prevState) {
        if (this.state.publicKey !== prevState.publicKey && !this.state.isUpdated) {
            this.isVaultKey();
        }
    }

    getSelectedOption() {
        const { isGuardKey } = this.state;
        if (isGuardKey === 'isGuard') {
            return (
                <div className="MultisigEnableStep2_select-row no-hover">
                    <img src={images['sign-stellarguard']} alt="guard" />
                    <span>StellarGuard</span>
                </div>
            );
        }
        if (isGuardKey === 'other') {
            return (
                <div
                    className="MultisigEnableStep2_select-row no-hover">
                    <img src={images['sign-unknown']} alt="unknown-signer" />
                    <span>Other</span>
                </div>
            );
        }
        return (
            <span>Select multisig provider</span>
        );
    }

    handleSelect(value) {
        this.setState({
            isGuardKey: value,
            selectError: '',
            isOpenSelect: false,
        });
    }

    handleInput(e) {
        e.preventDefault();
        this.setState({
            publicKey: e.target.value,
            valid: StellarSdk.StrKey.isValidEd25519PublicKey(e.target.value),
            inputError: '',
            selectError: '',
            isUpdated: false,
            isVaultKey: undefined,
            isGuardKey: 'noChoosed',
        });
    }

    openSelect() {
        this.setState({
            isOpenSelect: !this.state.isOpenSelect,
            isGuardKey: 'noChoosed',
        });
    }

    goBack() {
        const { submit, d } = this.props;
        submit.cancel();
        if (d.session.account.signers.length === 1) {
            d.modal.handlers.activate('multisigEnableStep1', d);
        }
    }

    isVaultKey() {
        const { publicKey, valid } = this.state;
        if (valid) {
            this.props.d.session.handlers.isLobstrVaultKey(publicKey).then(
                (res) => {
                    this.setState({
                        isVaultKey: res[0].exists,
                        isUpdated: true,
                    });
                },
            );
        }
    }

    async addSigner() {
        if (!this.state.valid) {
            this.setState({
                inputError: 'Incorrect Stellar public key',
            });
            return;
        }

        let signerProvider;
        if (this.state.isVaultKey) {
            signerProvider = 'lobstrVault';
        }
        if (this.props.d.session.account.signers.length > 1 && !this.state.isVaultKey) {
            this.setState({
                inputError: 'You can add additional signatures only with the LOBSTR VAULT',
            });
            return;
        }
        if (this.state.isGuardKey === 'isGuard') {
            signerProvider = 'stellarGuard';
        }
        if (!this.state.isVaultKey && this.state.isGuardKey === 'noChoosed') {
            this.setState({
                selectError: 'Please choose your multisig provider',
            });
            return;
        }
        const { publicKey } = this.state;
        const signerData = {
            signerProvider,
            publicKey,
        };
        this.props.submit.cancel();
        this.props.d.modal.handlers.activate('multisigEnableStep3', signerData);
    }

    render() {
        const { isVaultKey, inputError, publicKey, valid, isOpenSelect, selectError } = this.state;
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
                            placeholder="Stellar public key" />

                        {isVaultKey &&
                        <span className="MultisigEnableStep2_vault">LOBSTR Vault key</span>}

                        {inputError &&
                        <span className="MultisigEnableStep2_error">{inputError}</span>}
                    </div>

                    {(valid && isVaultKey !== undefined && !isVaultKey) &&
                        <div>
                            <label htmlFor="select" className="MultisigEnableStep2_select-label">
                                Multisig provider
                            </label>
                            <div id="select" className="MultisigEnableStep2_select-wrap">
                                <div className="MultisigEnableStep2_select" onClick={() => this.openSelect()}>
                                    {this.getSelectedOption()}
                                    <img
                                        src={images.dropdown}
                                        alt="arrow"
                                        className={isOpenSelect ? 'isOpen' : ''} />
                                </div>
                                {isOpenSelect &&
                                    <div className="MultisigEnableStep2_select-options">
                                        <div
                                            className="MultisigEnableStep2_select-row"
                                            onClick={() => this.handleSelect('isGuard')}>
                                            <img src={images['sign-stellarguard']} alt="guard" />
                                            <span>StellarGuard</span>
                                        </div>
                                        <div
                                            className="MultisigEnableStep2_select-row"
                                            onClick={() => this.handleSelect('other')}>
                                            <img src={images['sign-unknown']} alt="signer-unknown" />
                                            <span>Other</span>
                                        </div>
                                    </div>}
                                {selectError &&
                                    <span className="MultisigEnableStep2_error">{selectError}</span>}
                            </div>
                        </div>}
                </div>
                <div className="Modal_button-block">
                    <button
                        className="cancel-button"
                        onClick={() => this.goBack()}>
                        Back
                    </button>
                    <button
                        disabled={valid && isVaultKey === undefined}
                        className="s-button"
                        onClick={() => this.addSigner()}>Add signer</button>
                </div>
            </div>
        );
    }
}
MultisigEnableStep2.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
};

