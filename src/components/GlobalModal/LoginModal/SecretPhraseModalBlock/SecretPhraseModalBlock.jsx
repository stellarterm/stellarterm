import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';
import Driver from '../../../../lib/Driver';


export default class SecretPhraseModalBlock extends React.Component {
    getContent() {
        const secretPhrase = localStorage.getItem('security-phrase') || '';
        if (secretPhrase) {
            return (
                <React.Fragment>
                    <p className="SecretPhrase_title">
                        <img src={images['icon-circle-success']} alt="warn" className="SecretPhrase_img-blinking" />
                        Make sure that your Secret Phrase is
                    </p>
                    <p className="SecretPhrase_phrase">
                        {secretPhrase}
                    </p>
                    <p className="SecretPhrase_description">
                        Secret Phrase could be missing if you access StellarTerm from a new device or a new browser.
                    </p>
                </React.Fragment>
            );
        }

        return (
            <React.Fragment>
                <p className="SecretPhrase_title SecretPhrase_title-alert">
                    <img src={images['icon-warning-small-red']} alt="warn" className="SecretPhrase_img-blinking" />
                    Secret Phrase not found
                </p>
                <p className="SecretPhrase_content">
                    Secret Phrase can help you verify that you are using authentic StellarTerm website and
                    save you from phishing attacks.
                </p>
                <p
                    onClick={() => {
                        this.props.d.modal.handlers.cancel();
                        this.props.d.modal.handlers.activate(
                            'SecretPhraseSetup', () => {});
                    }}
                    className="SecretPhrase_button">
                    Configure Secret Phrase
                    <img src={images['icon-arrow-right-green']} alt="->" />
                </p>
            </React.Fragment>
        );
    }
    render() {
        const content = this.getContent();
        return (
            <div className="SecretPhraseModalBlock-wrap SecretPhrase">
                {content}
            </div>
        );
    }
}
SecretPhraseModalBlock.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
