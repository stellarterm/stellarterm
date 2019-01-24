import React from 'react';
import Phrases from './SecurityPhrases.json';

export default class SecurityPhrase extends React.Component {
    constructor(props) {
        super(props);
        const securityPhrase = localStorage.getItem('security-phrase') || '';
        this.state = {
            isSecurityPhraseMissing: !securityPhrase,
            showSecurityPhraseForm: false,
            securityPhrase,
        };
    }

    toggleForm() {
        const currentState = this.state.showSecurityPhraseForm;
        this.setState({
            showSecurityPhraseForm: !currentState,
        });
    }

    changeSecPhrase(securityPhrase) {
        this.setState({ securityPhrase });
    }

    generatePhrase() {
        const phrasesCount = Phrases.length;
        const randomIndex = (Math.random() * (phrasesCount - 1)).toFixed();
        const securityPhrase = Phrases[randomIndex] || '';
        this.setState({ securityPhrase });
    }

    saveSecurityPhrase() {
        const { securityPhrase = '' } = this.state;
        if (securityPhrase.length < 5) { return; }
        localStorage.setItem('security-phrase', securityPhrase);
        this.setState({ isSecurityPhraseMissing: false });
    }

    renderContent() {
        const { isSecurityPhraseMissing } = this.state;
        return isSecurityPhraseMissing ?
            this.renderSPWarning() :
            this.renderSP();
    }

    renderSPWarning() {
        const { showSecurityPhraseForm, securityPhrase } = this.state;

        return (
            <div>

                <div className="sp_warning">
                    <div
                        className="LoginPage__accept__link create_sp"
                        onClick={() => this.toggleForm()}>
                        { showSecurityPhraseForm ? 'Hide form' : 'Create Security Phrase' }
                    </div>

                    <div className="security-phrase-text warning-text">
                        <span className="bold">Your Security Phrase is missing!</span> It can be possible if you enter
                        this site with a new device. If you don‘t, please check the url to make sure you
                        are on the correct website.
                    </div>
                </div>


                <div className={`SecurityPhrase__form ${showSecurityPhraseForm ? '' : 'closed'}`}>
                    <label className="s-inputGroup LoginPage__inputGroup" htmlFor="sp_phrase">
                        <input
                            id="sp_phrase"
                            type="text"
                            className="s-inputGroup__item S-flexItem-share LoginPage__password"
                            value={securityPhrase}
                            onChange={event => this.changeSecPhrase(event.target.value)}
                            placeholder="Enter Security Phrase (At least 5 letters)" />

                        <div>
                            <div
                                className="LoginPage__show s-button s-button--light save-ps-button"
                                onClick={() => this.generatePhrase()}>Generate</div>
                        </div>
                    </label>

                    <div
                        className="LoginPage__submit s-button"
                        disabled={!securityPhrase || securityPhrase.length < 5}
                        onClick={() => this.saveSecurityPhrase()}>Save</div>
                </div>
            </div>
        );
    }

    renderSP() {
        const { securityPhrase } = this.state;
        return (
            <div className="security-phrase-text success-text">
                <span className="bold">Your Security Phrase:</span> {securityPhrase}
            </div>
        );
    }

    render() {
        const { isSecurityPhraseMissing } = this.state;
        const className = isSecurityPhraseMissing ? 'missing' : 'exists';

        return (
            <div className={`SecurityPhrase ${className}`}>
                <div className="SecurityPhrase__container">
                    {this.renderContent()}
                </div>
            </div>
        );
    }

}
