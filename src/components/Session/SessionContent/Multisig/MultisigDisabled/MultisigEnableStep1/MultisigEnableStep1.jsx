import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';

const images = require('../../../../../../images');

export default function MultisigEnableStep1(props) {
    const { submit, d } = props;
    return (
        <div className="MultisigEnableStep1">
            <div className="Modal_header">
                <span>Install LOBSTR Vault</span>
                <img src={images['icon-close']} alt="X" onClick={() => submit.cancel()} />
            </div>
            <div className="MultisigEnableStep1_content">
                <img src={images['sign-vault']} alt="vault" />
                <span>Multisignature works best with LOBSTR Vault - mobile app for signing transactions</span>
                <div className="MultisigEnableStep1_mobile">
                    <a href="https://itunes.apple.com/us/app/lobstr-vault/id1452248529?ls=1&mt=8" target="_blank">
                        <img src={images.ios} alt="LOBSTR Vault for iOS" />
                    </a>
                    <a href="https://play.google.com/store/apps/details?id=com.lobstr.stellar.vault" target="_blank">
                        <img src={images.gplay} alt="LOBSTR Vault for Android" />
                    </a>
                </div>
            </div>
            <div className="Modal_button-block">
                <button className="cancel-button" onClick={() => submit.cancel()}>Cancel</button>
                <button
                    className="s-button"
                    onClick={() => {
                        submit.cancel();
                        d.modal.handlers.activate('multisigEnableStep2', d);
                    }}>
                    Next
                </button>
            </div>
        </div>
    );
}
MultisigEnableStep1.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    d: PropTypes.instanceOf(Driver),
};
