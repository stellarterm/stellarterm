const React = window.React = require('react');

// TODO: Move this into Validator
const isValidSecretKey = input => {
  try {
    StellarSdk.Keypair.fromSecret(input);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const isValidBip32Path = input => {
  if (!input.startsWith("44'/148'")) {
    return false;
  }
  input.split('/').forEach(function (element) {
    if (!element.toString().endsWith('\'')) {
      return false;
    }
  });
  return true;
}

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: '',
      invalidKey: false,
      newKeypair: null,
      ledgerStatus: 'None',
      bip32Path: "44'/148'/0'"
    }

    this.handleInput = (event) => {
      if (event.target.name === 'bip32Path') {
        this.setState({bip32Path: event.target.value});
      } else {
        this.setState({secretInput: event.target.value});
      }
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      if (!isValidSecretKey(this.state.secretInput)) {
        return this.setState({
          invalidKey: true,
        })
      }
      this.props.handler(this.state.secretInput, false);
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
    this.proceedWithLedger = (event) => {
      event.preventDefault();
      if (!isValidBip32Path(this.state.bip32Path)) {
        return this.setState({
          invalidBip32Path: true
        });
      }
      props.handler(null, true, this.state.bip32Path);
    }
    props.connectLedger(() => {
      this.setState({ ledgerStatus: 'Connected' });
    }, (err) => {
      this.setState({ ledgerStatus: 'Error: ' + err });
    });
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

    let ledgerStatus = this.state.ledgerStatus === 'Connected' ? 'Connected' : 'Not Connected';
    let ledgerErrorMessage;
    if (this.state.invalidBip32Path) {
      ledgerErrorMessage = <div className="s-alert s-alert--alert">Invalid BIP32 path. Stellar BIP32 paths must be of the form 44'/148'/n'.</div>
    }

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
                <div>
                  <input type="password" className="LoginForm__password" value={this.state.secretInput} onChange={this.handleInput} placeholder="Secret key (example: SBSMVCIWBL3HDB7N4EI3QKBKI4D5ZDSSDF7TMPB.....)" />
                </div>
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
                <li>For extra security, you can <a href="https://github.com/irisli/stellarterm">build from source</a> or <a href="https://github.com/stellarterm/stellarterm.github.io/">download from GitHub</a> and verify the hash.</li>
                <li>StellarTerm is released under the Apache 2.0. It is provided "AS IS" without warranty. The developer is not responsible for any losses and activities caused by the application.</li>
              </ul>
            </div>
          </div>
          <div className="LoginForm">
            <div className="LoginForm__form">
              <p className="LoginForm__intro">Sign in with Ledger Nano S</p>
              <form onSubmit={this.proceedWithLedger}>
                <div>
                  <input name="bip32Path" type="text" className="LoginForm__password" value={this.state.bip32Path} onChange={this.handleInput} placeholder="BIP32 path, e.g.: 44'/148'/0'" />
                </div>
                {ledgerErrorMessage}
                <div>
                  <input type="submit" className="LoginForm__submit s-button" value="Sign in with Ledger" disabled={ledgerStatus !== 'Connected'}/>
                </div>
              </form>
            </div>
            <div className="LoginForm__notes">
              <h3>Instructions</h3>
              <ul>
                <li>Ledger Nano S support is available on Chrome and Opera.</li>
                <li>Install the Stellar app with the <a href="https://www.ledgerwallet.com/apps/manager">Ledger Manager</a>.</li>
                <li>Enable browser support in the app settings.</li>
                <li>Choose the BIP32 path of the account you want use: 44'/148'/n' where n is the account index. Or use the default account 44'/148'/0'.</li>
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
