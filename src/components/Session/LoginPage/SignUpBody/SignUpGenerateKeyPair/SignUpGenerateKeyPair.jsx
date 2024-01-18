import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from '@stellar/stellar-sdk';
import createStellarIdenticon from 'stellar-identicon-js';
import images from '../../../../../images';
import SignUpSecurityNotes from '../SignUpSecurityNotes/SignUpSecurityNotes';
import CopyButton from '../../../../Common/CopyButton/CopyButton';


export default class SignUpGenerateKeyPair extends React.Component {
    constructor(props) {
        super(props);
        const keyPair = StellarSdk.Keypair.random();
        this.state = {
            pubKey: keyPair.publicKey(),
            secretKey: keyPair.secret(),
            acceptedSafety: false,
        };
    }

    handleGenerate() {
        const keyPair = StellarSdk.Keypair.random();
        this.setState({
            pubKey: keyPair.publicKey(),
            secretKey: keyPair.secret(),
        });
    }

    handleToggle() {
        this.setState({ acceptedSafety: !this.state.acceptedSafety });
    }

    render() {
        const { prevStep } = this.props;
        const { pubKey, secretKey, acceptedSafety } = this.state;
        const canvas = pubKey && createStellarIdenticon(pubKey);
        const renderedIcon = (<img width="14" height="14" src={canvas.toDataURL()} alt="ident" />);
        return (
            <div className="SignUpGenerateKeyPair">
                <div className="SignUpGenerateKeyPair_padding">
                    <div className="SignUpGenerateKeyPair_header">
                        <div className="SignUpGenerateKeyPair_header-back">
                            <img src={images['icon-arrow-left-green-large']} alt="<" onClick={() => prevStep()} />
                        </div>
                    </div>
                    <div className="SignUpGenerateKeyPair_titles">
                        <span className="LoginPage__title">New Stellar account</span>
                        <span>
                            To get started on using the Stellar network, a new unique keypair has been
                             generated for you. Keypair represents the public and secret keys of your Stellar account.
                        </span>
                    </div>
                    <div className="SignUpGenerateKeyPair_generate-block">
                        <div className="SignUpGenerateKeyPair_block-left">
                            <span className="SignUpGenerateKeyPair_label">Your new public key </span>
                            <div className="SignUpGenerateKeyPair_generate-block-key">
                                <div className="SignUpGenerateKeyPair_generate-block-key-wrap">
                                    <div className="SignUpGenerateKeyPair_generate-block-image">
                                        <div className="SignUpGenerateKeyPair_identicon">{renderedIcon}</div>
                                    </div>
                                    {pubKey}
                                </div>
                            </div>
                            <span className="SignUpGenerateKeyPair_label">Your new secret key </span>
                            <div className="SignUpGenerateKeyPair_generate-block-key">
                                <div className="SignUpGenerateKeyPair_generate-block-key-wrap">
                                    <div className="SignUpGenerateKeyPair_generate-block-image">
                                        <img src={images['icon-lock-gray']} alt="lock" />
                                    </div>
                                    {secretKey}
                                </div>
                                <CopyButton text={secretKey} onlyIcon />
                            </div>
                            <div className="SignUpGenerateKeyPair_actions">
                                <div className="InfoBlockWithHoverDescription_icon-with-text">
                                    <div className="InfoBlockWithHoverDescription">
                                        <img src={images['icon-info-gray']} alt="i" />
                                        <SignUpSecurityNotes />
                                    </div>
                                    <span>Account generation security notes</span>
                                </div>
                                <span
                                    onClick={() => this.handleGenerate()}
                                    className="LoginPage_green-link">
                                    Generate another keypair
                                </span>
                            </div>
                        </div>

                        <div className="SignUpGenerateKeyPair_block-right">
                            <p className="SignUpGenerateKeyPair_desc-title">About public key</p>
                            <p className="SignUpGenerateKeyPair_desc-content">
                                Used to identify an account and receive funds. It is also known as an account and
                                will be used as your account ID.
                            </p>
                            <p className="SignUpGenerateKeyPair_desc-title">About secret key</p>
                            <p className="SignUpGenerateKeyPair_desc-content">
                                Used to access your account and make transactions. Anyone with the key will have full
                                access to the account and funds. If you lose the key, you will no longer be able to
                                access the funds and there is no recovery mechanism.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="SignUpGenerateKeyPair_confirm-block SignUpGenerateKeyPair_generate-block">
                    <div className="SignUpGenerateKeyPair_block-left">
                        <div className="SignUpGenerateKeyPair_accept" onClick={() => this.handleToggle()}>
                            <input
                                onChange={() => this.handleToggle()}
                                type="checkbox"
                                checked={acceptedSafety} />
                            <span>I&apos;ve backed up my secret key in a safe place</span>
                        </div>
                        <button
                            onClick={() => this.props.nextStep()}
                            className="s-button"
                            disabled={!acceptedSafety}>
                            Continue
                        </button>
                    </div>
                    <div className="SignUpGenerateKeyPair_block-right">
                        <p className="SignUpGenerateKeyPair_desc-title SignUpGenerateKeyPair_desc-title-backup">
                            <img src={images['icon-warning-small']} alt="warn" />
                            Backup the secret key and keep it secure!
                        </p>
                        <p>
                            This secret key will only be shown to you once. Always keep this key safe and secure.
                            StellarTerm does not save it and will not be able to help you recover it if lost.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
SignUpGenerateKeyPair.propTypes = {
    prevStep: PropTypes.func,
    nextStep: PropTypes.func,
};
