import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';

const images = require('../../../../../../images');

export default function MultisigDisableModal(props) {
    const { submit, d, signerKey } = props;
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
                    onClick={() => {
                        submit.cancel();
                        d.session.handlers.removeSigner(signerKey);
                    }} >
                    Remove
                </button>
            </div>
        </div>
    );
}
MultisigDisableModal.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
    signerKey: PropTypes.string,
};
