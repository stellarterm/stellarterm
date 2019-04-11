import React from 'react';
import PropTypes from 'prop-types';
import SignerDataRow from './SignerDataRow/SignerDataRow';
import Driver from '../../../../../lib/Driver';

const images = require('../../../../../images');


export default class MultisigEnabled extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            onlyVaultSigners: true,
        };
    }

    getSigners() {
        const { signers } = this.props.d.session.account;
        return signers.sort((a, b) => a.key.localeCompare(b.key)).map(signer => (
            <SignerDataRow
                key={signer.key}
                signer={signer}
                d={this.props.d}
                noVault={() => this.checkNoVaultSigner()} />
        ));
    }

    getSignerData() {
        const { signers } = this.props.d.session.account;
        const guardKey = this.props.d.session.handlers.getSignerMarker('stellarGuard');
        let image = 'sign-unknown';
        let provider = 'unknown signer';
        if (this.state.onlyVaultSigners) {
            image = 'sign-vault';
            provider = 'LOBSTR Vault';
        }
        if (signers.find(signer => signer.key === guardKey)) {
            image = 'sign-stellarguard';
            provider = 'StellarGuard';
        }
        return (
            <div className="MultisigEnabled-header-content">
                <div className="MultisigEnabled-header-logo">
                    <img src={images[image]} alt={provider} />
                </div>
                <div className="MultisigEnabled-header-text">
                    <h1>Multisignature enabled</h1>
                    <span>
                        Account protected by {provider}.
                    </span>
                </div>
            </div>
        );
    }

    getRequiredSignersData() {
        const { signers } = this.props.d.session.account;

        if (signers.length < 4 || !this.state.onlyVaultSigners) {
            return null;
        }
        const requiredSigner = this.props.d.session.account.thresholds.low_threshold / 10;

        return (
            <div className="MultisigEnabled-header-required-signers">
                <span>
                    {requiredSigner} of {signers.length - 1} signers required to sign transactions.
                    (Your account + {requiredSigner - 1} co-signer)
                </span>
                <div
                    className="CopyButton"
                    onClick={() => this.props.d.modal.handlers.activate('multisigSetRequiredSigners')}>
                    <img src={images['icon-edit']} alt="edit" />
                    <span>EDIT</span>
                </div>
            </div>
        );
    }

    checkNoVaultSigner() {
        this.setState({ onlyVaultSigners: false });
    }

    addNewSigner() {
        this.props.d.modal.handlers.activate('multisigEnableStep2', this.props.d);
    }

    render() {
        return (
            <div className="MultisigEnabled">
                <div className="MultisigEnabled-header">
                    <div className="MultisigEnabled-header-wrap">
                        {this.getSignerData()}
                        <a
                            className="MultisigEnabled-header-wrap-info"
                            href="https://lobstr.zendesk.com/hc/en-us/categories/360001534333-LOBSTR-Vault"
                            target="_blank">
                            <img src={images['icon-info']} alt="i" />
                        </a>
                    </div>

                    {this.getRequiredSignersData()}
                </div>
                <div className="MultisigEnabled-signers-block">
                    <div className="MultisigEnabled-signers-header">
                        <span>Account</span>
                        <span>Public key</span>
                        <span>Weight</span>
                    </div>
                    {this.getSigners()}

                    {this.state.onlyVaultSigners &&
                        <button className="s-button" onClick={() => this.addNewSigner()}>Add signer</button>}
                </div>
            </div>
        );
    }
}
MultisigEnabled.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
