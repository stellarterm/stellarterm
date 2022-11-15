import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/driver/Driver';
import { MULTISIG_PROVIDERS, SIGNER_KINDS } from '../../../../../../lib/constants/multisigConstants';

const images = require('../../../../../../images');

export default function MultisigDisableModal(props) {
    const { submit, d, signer } = props;

    const removeSigner = () => {
        submit.cancel();

        const { multisigProvider, signers } = d.multisig;

        const cosigners = signers.filter(({ kind }) => kind === SIGNER_KINDS.COSIGNER);

        const isGuardCosigner = multisigProvider === MULTISIG_PROVIDERS.STELLAR_GUARD
            && signer.kind === SIGNER_KINDS.COSIGNER;

        const isLastVaultCosigner = cosigners.length === 1 && multisigProvider === MULTISIG_PROVIDERS.LOBSTR_VAULT;

        const isLastCustomSigner = signer.kind === SIGNER_KINDS.CUSTOM && signers.length === 2;

        if (isGuardCosigner || isLastVaultCosigner || isLastCustomSigner) {
            d.multisig.disableMultisig();
        } else {
            d.multisig.removeSigner(signer);
        }
    };

    return (
        <div className="MultisigDisableModal">
            <div className="Modal_header">
                <span>Remove signer from your Stellar account?</span>
                <img src={images['icon-close']} alt="X" onClick={() => submit.cancel()} />
            </div>
            <div className="MultisigDisableModal_content">
                <span>
                    Please confirm removal of signer account.
                    Once completed this signer will no longer confirm your transactions.
                </span>
            </div>
            <div className="Modal_button-block">
                <button className="cancel-button" onClick={() => submit.cancel()}>Cancel</button>
                <button
                    className="s-button"
                    onClick={() => removeSigner()}
                >
                    Remove
                </button>
            </div>
        </div>
    );
}
MultisigDisableModal.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
    signer: PropTypes.objectOf(PropTypes.any),
};
