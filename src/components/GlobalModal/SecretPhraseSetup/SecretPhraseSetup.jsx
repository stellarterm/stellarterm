import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';
import Phrases from './SecretPhrases.json';
import Sep7Handler from '../../HomePage/Sep7Handler/Sep7Handler';
import Driver from '../../../lib/driver/Driver';


export default class SecretPhraseSetup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            secretPhrase: '',
            buttonReady: true,
        };
    }

    handleInput({ target }) {
        this.setState({
            secretPhrase: target.value,
        });
    }

    generatePhrase() {
        const { length: phrasesCount } = Phrases;
        const randomIndex = (Math.random() * (phrasesCount - 1)).toFixed();
        const secretPhrase = Phrases[randomIndex] || '';
        this.setState({ secretPhrase });
    }

    savePhrase() {
        const { secretPhrase } = this.state;

        if (secretPhrase.length < 5) {
            return;
        }
        localStorage.setItem('security-phrase', secretPhrase);
        this.props.update();
        this.props.submit.cancel();
        Sep7Handler(this.props.d);
    }

    render() {
        const { submit, d } = this.props;
        const { secretPhrase, buttonReady } = this.state;
        return (
            <div className="SecretPhraseSetup">
                <div className="Modal_header">
                    <span>Secret Phrase not found!</span>
                    <img
                        src={images['icon-close']}
                        alt="X"
                        onClick={() => {
                            submit.cancel();
                            Sep7Handler(d);
                        }}
                    />
                </div>
                <div className="SecretPhraseSetup_wrap">
                    <p className="SecretPhraseSetup_title">
                        A Secret Phrase can help you verify that you are using authentic StellarTerm website and save
                         you from phishing attacks.
                    </p>
                    <p>
                        Have you configured your Secret Phrase? If you did, be careful, as it should always be
                         present here when you are accessing your account.
                    </p>
                    <ul className="SecretPhraseSetup_description">
                        <li className="SecretPhraseSetup_description-item">
                            The Phrase could be missing if you access StellarTerm from a new device or a new browser.
                        </li>
                        <li className="SecretPhraseSetup_description-item">
                            Always check the URL to make sure you are on the correct website.
                        </li>
                    </ul>
                    <p>
                        If you haven’t configured a Secret Phrase yet, we highly recommend you to do it now.
                    </p>
                    <p className="SecretPhraseSetup_label">Your secret phrase</p>
                    <input
                        type="text"
                        onChange={e => this.handleInput(e)}
                        value={secretPhrase}
                        placeholder="Enter Secret Phrase (at least 5 symbols)"
                        className="LoginPage__password"
                    />
                    <span onClick={() => this.generatePhrase()} className="SecretPhraseSetup_generate">Generate</span>
                    <div className="Modal_button-block">
                        <button
                            className="cancel-button"
                            disabled={!buttonReady}
                            onClick={() => {
                                submit.cancel();
                                Sep7Handler(d);
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="s-button"
                            disabled={!buttonReady || secretPhrase.length < 5}
                            onClick={() => this.savePhrase()}
                        >
                            {buttonReady ? 'Save' : <div className="nk-spinner" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
SecretPhraseSetup.propTypes = {
    submit: PropTypes.objectOf(PropTypes.func),
    update: PropTypes.func,
    d: PropTypes.instanceOf(Driver),
};
