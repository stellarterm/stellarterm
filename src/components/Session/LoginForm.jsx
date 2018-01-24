const React = window.React = require('react');

// TODO: Move this into Validator
const isValidSecretKey = input => {
  try {
    StellarSdk.Keypair.fromSecret(input);
    return true;
  } catch (e) {
    // console.error(e);
    return false;
  }
}

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: '',
      show: false,
      invalidKey: false,
      newKeypair: null,
    }

    this.handleInput = (event) => {
      this.setState({secretInput: event.target.value});
    }
    this.toggleShow = (event) => {
      event.preventDefault();
      this.setState({show: !this.state.show});
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      if (!isValidSecretKey(this.state.secretInput)) {
        return this.setState({
          invalidKey: true,
        })
      }
      this.props.handler(this.state.secretInput);
    }
    this.handleGenerate = event => {
      let keypair = StellarSdk.Keypair.random();
      this.setState({
        newKeypair: {
          pubKey: keypair.publicKey(),
          secretKey: keypair.secret(),
        }
      });
    }
  }

  render() {
    let errorMessage;
    if (this.state.invalidKey) {
      errorMessage = <div className="s-alert s-alert--alert">Invalid secret key. Hint: it starts with the letter S and is all uppercase</div>
    } else if (this.props.setupError) {
      errorMessage = <div className="s-alert s-alert--alert">Unable to contact network. Please check your internet connection and allow connections to horizon.stellar.org. Maybe a adblocker is preventing the client from communicating with the network.</div>
    }

    let newKeypairDetails;
    if (this.state.newKeypair !== null) {
      newKeypairDetails = <div className="LoginForm__generatedNote">
        <p><strong>Keep your key secure. This secret key will only be showed to you once. StellarTerm does not save it and will not be able to help you recover it if lost.</strong></p>
        <p>Public key (will be your Account ID): {this.state.newKeypair.pubKey}</p>
        <p>Secret key (<strong>SAVE THIS AND KEEP THIS SECURE</strong>): {this.state.newKeypair.secretKey}</p>
      </div>
    }

    let inputType = this.state.show ? 'text' : 'password';

    return <div className="so-back islandBack islandBack--t">
      <div className="island island--pb">
        <div>
          <div className="island__header">
            Log in
          </div>
          <div className="LoginForm">
            <div className="LoginForm__form">
              <p className="LoginForm__intro">Log in with your secret key to manage your account.</p>
              <form onSubmit={this.handleSubmit}>
                <label className="s-inputGroup LoginForm__inputGroup">
                  <input type={inputType} className="s-inputGroup__item S-flexItem-share LoginForm__password" value={this.state.secretInput} onChange={this.handleInput} placeholder="Secret key (example: SBSMVCIWBL3HDB7N4EI3QKBKI4D5ZDSSDF7TMPB.....)" />
                  <div>
                    <a className="LoginForm__show s-button s-button--light" onClick={this.toggleShow}>Show</a>
                  </div>
                </label>
                {errorMessage}
                <div>
                  <input type="submit" className="LoginForm__submit s-button" value="Log in"></input>
                </div>
              </form>
            </div>
            <div className="LoginForm__notes">
              <h3>Security notes</h3>
              <ul>
                <li>Check the url to make sure you are on the correct website.</li>
                <li>Stellarterm does not save your secret key. It is stored on your browser and will be deleted once the page is refreshed or exited.</li>
                <li>For extra security, you can <a href="https://github.com/irisli/stellarterm" target="_blank" rel="nofollow noopener noreferrer">build from source</a> or <a href="https://github.com/stellarterm/stellarterm.github.io/" target="_blank" rel="nofollow noopener noreferrer">download from GitHub</a> and verify the hash.</li>
                <li>StellarTerm is released under the Apache 2.0. It is provided "AS IS" without warranty. The developer is not responsible for any losses and activities caused by the application.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="LoginForm">
          <div className="LoginForm__form">
            <h3>Create Account Keypair</h3>
            <p>To get started on using the Stellar network, you must first create a keypair. The keypair consists of two parts:</p>
            <ul>
              <li><strong>Public key</strong>: The public key is used to identify the account. It is also known as an account. This public key is used for receiving funds.</li>
              <li><strong>Secret key</strong>: The secret key is used to access your account and make transactions. Keep this code safe and secure. Anyone with the code will have full access to the account and funds. If you lose the key, you will no longer be able to access the funds and there is no recovery mechanism.</li>
            </ul>
            <input type="submit" className="LoginForm__generate s-button" onClick={this.handleGenerate} value="Generate keypair"></input>
            {newKeypairDetails}
          </div>
          <div className="LoginForm__notes">
            <h3>Account generation security notes</h3>
            <p>The key is generated using entropy from <a href="https://github.com/dchest/tweetnacl-js#random-bytes-generation">TweetNaCl's randomByte function</a> which, in most browsers, uses getRandomValues from the <a href="https://w3c.github.io/webcrypto/Overview.html">Web Cryptography API</a>. However, using a secure random number generation does not protect you from a compromised computer. Take great care to make sure your computer is secure and do not run this on a computer you do not trust.</p>
          </div>
        </div>
      </div>
    </div>
  }
}
