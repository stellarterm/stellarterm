import React from 'react';
import PropTypes from 'prop-types';
import SignerDataRow from './SignerDataRow/SignerDataRow';
import Driver from '../../../../../lib/driver/Driver';
import {
    CUSTOM_CONFIG_DATA,
    MULTISIG_PROVIDERS,
    PROVIDER_DATA,
    SIGNER_KINDS,
} from '../../../../../lib/constants/multisigConstants';

const images = require('../../../../../images');


export default class MultisigEnabled extends React.Component {
    getSigners() {
        const { signers } = this.props.d.multisig;

        return signers.map(signer => (
            <SignerDataRow
                key={signer.key}
                signer={signer}
                d={this.props.d}
            />
        ));
    }

    addNewSigner() {
        this.props.d.modal.handlers.activate('multisigEnableStep2', this.props.d);
    }

    render() {
        const { multisig } = this.props.d;
        const { multisigProvider, isCustomConfig, signers, requiredSigners } = multisig;

        const isVaultProvider = multisigProvider === MULTISIG_PROVIDERS.LOBSTR_VAULT;
        const cosigners = signers.filter(({ kind }) => kind === SIGNER_KINDS.COSIGNER);

        const showRequiredSigners = cosigners.length >= 2 && isVaultProvider && !isCustomConfig;


        const { logo, title } = multisigProvider ? PROVIDER_DATA[multisigProvider] : CUSTOM_CONFIG_DATA;

        return (
            <div className="MultisigEnabled">
                <div className="MultisigEnabled-header">
                    <div className="MultisigEnabled-header-wrap">

                        <div className="MultisigEnabled-header-content">
                            <div className="MultisigEnabled-header-logo">
                                <img src={images[logo]} alt={title} />
                            </div>
                            <div className="MultisigEnabled-header-text">
                                <h1>Multisignature enabled</h1>
                                <span>
                                    Account protected by {title}.
                                </span>
                            </div>
                        </div>

                        <a
                            className="MultisigEnabled-header-wrap-info"
                            href="https://lobstrvault.freshdesk.com/support/solutions/151000012441"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <img src={images['icon-info']} alt="i" />
                        </a>
                    </div>

                    {showRequiredSigners &&
                        <div className="MultisigEnabled-header-required-signers">
                            <span>
                                {requiredSigners} of { cosigners.length + 1 } signers required to sign transactions.
                                (Your account + {requiredSigners - 1} co-signer{requiredSigners > 1 && 's'})
                            </span>
                            <div
                                className="CopyButton"
                                onClick={() => this.props.d.modal.handlers.activate('multisigSetRequiredSigners')}
                            >
                                <img src={images['icon-edit']} alt="edit" />
                                <span>EDIT</span>
                            </div>
                        </div>
                    }
                </div>
                <div className="MultisigEnabled-signers-block">
                    <div className="MultisigEnabled-signers-header">
                        <span>Account</span>
                        <span>Public key</span>
                        <span>Weight</span>
                    </div>
                    {this.getSigners()}

                    {!isCustomConfig && isVaultProvider &&
                        <button className="s-button" onClick={() => this.addNewSigner()}>Add signer</button>}
                </div>
            </div>
        );
    }
}
MultisigEnabled.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
