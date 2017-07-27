const React = window.React = require('react');

const isValidSecretKey = input => {
  try {
    StellarSdk.Keypair.fromSeed(input);
    return true;
  } catch (e) {
    return false;
  }
}

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: '',
      invalidKey: false,
    }

    this.handleInput = (event) => {
      this.setState({secretInput: event.target.value});
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      isValidSecretKey(this.state.secretInput);
      this.setState({
        invalidKey: true,
      })
      this.props.handler(this.state.secretInput);
    }
  }

  render() {
    let errorMessage;
    if (this.state.invalidKey) {
      errorMessage = <div className="s-alert s-alert--alert">Invalid secret key. Hint: it starts with the letter S and is all uppercase</div>
    } else if (this.props.setupError) {
      errorMessage = <div className="s-alert s-alert--alert">Unable to find account. Make sure that your account is on the public network and funded with 20 lumens.</div>
    }
    return <div className="so-back islandBack islandBack--t">
      <div className="island island--pb">
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
              <li>StellarTerm is released under the Apache 2.0. It is provided "AS IS" without warranty. The developer puts a good faith effort to keep the application secure but is not responsible for any losses and activities caused by the application.
            </ul>
          </div>
        </div>
      </div>
    </div>
  }
}
