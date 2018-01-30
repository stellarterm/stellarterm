const React = window.React = require('react');
import LoginForm from './Session/LoginForm.jsx';
import AccountView from './Session/AccountView.jsx';
import ManageCurrentTrust from './Session/ManageCurrentTrust.jsx';
import ManuallyAddTrust from './Session/ManuallyAddTrust.jsx';
import AddTrustFromFederation from './Session/AddTrustFromFederation.jsx';
import AddTrustFromDirectory from './Session/AddTrustFromDirectory.jsx';
import Send from './Session/Send.jsx';
import Inflation from './Session/Inflation.jsx';
import Deposit from './Session/Deposit.jsx';
import Generic from './Generic.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import Loading from './Loading.jsx';
import HistoryView from './Session/HistoryView.jsx';

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenSession(() => {
      this.forceUpdate();
    });
    this.mounted = true;

    // KLUDGE: The event listeners are kinda messed up
    this.checkLoginStatus = () => {
      if (this.mounted) {
        if (this.props.d.session.state === 'in' || this.props.d.session.state === 'unfunded' ) {
          this.forceUpdate();
          setTimeout(this.checkLoginStatus, 500)
        } else {
          setTimeout(this.checkLoginStatus, 50)
        }
      }
    }
    setTimeout(this.checkLoginStatus, 50)

    // Static functions from driver
    this.handlers = this.props.d.handlers;
    this.logIn = this.props.d.handlers.logIn;
  }
  componentWillUnmount() {
    this.mounted = false;
    this.props.d.unlistenSession(this.listenId);
  }
  render() {
    let d = this.props.d;
    let state = d.session.state;
    let setupError = d.session.setupError;
    if (state === 'out') {
      return <LoginForm setupError={setupError} handler={this.logIn}></LoginForm>
    } else if (state === 'unfunded') {
      return <Generic title={'Account is unfunded'}><Loading darker={true}>
        Send at least 1 lumens to this account to activate it.
        <br />
        <br />
        This is required by the Stellar network. You can buy lumens from an exchange.
        <br />
        <br />
        Account ID: {d.session.unfundedAccountId}
      </Loading></Generic>
    } else if (state === 'loading') {
      return <Generic title="Loading account"><Loading>Contacting network and loading account</Loading></Generic>
    } else if (state === 'in') {
      // Inflation helps fund development of StellarTerm to make it better
      if (!d.session.inflationDone) {
        let currentVoteNote = '';
        if (d.session.account.inflation_destination) {
          currentVoteNote = ' This will overwrite your current inflation destination vote.'
        }
        return <div>
          <Generic>
            <h2 className="Session__welcomeTitle">Welcome to StellarTerm!</h2>
            <p>Please make sure you have your secret keys (starts with "S") securely backed up. You should protect your secret key and never share it with anyone.</p>
            <div className="Generic__divider"></div>
            <div className="Session__inflation">
              StellarTerm is free open source software. StellarTerm does not ask for donations, but instead, asks for inflation votes. The Stellar network rewards accounts that receive many votes through an "<a href="https://www.stellar.org/developers/guides/concepts/inflation.html" target="_blank" rel="nofollow noopener noreferrer">inflation system</a>". It is free to vote for StellarTerm and only requires a vote transaction (0.00001 XLM). Note: other wallets may do this without your permission, so if you use another wallet and they tamper with your account, this message may show up again.
              <br />
              <br />
              By pressing "continue", your account will vote for the StellarTerm inflation account. Thank you for your support!{currentVoteNote}
              <div className="Session__inflation__next">
                <button className="s-button" onClick={d.handlers.vote}>Continue</button>
                <a className="Session__inflation__next__noThanks" onClick={d.handlers.noThanks}>No thanks</a>
              </div>
            </div>
          </Generic>
        </div>
      }
      let content;
      let part1 = this.props.urlParts[1];

      if (part1 === undefined) {
        content = <ErrorBoundary>
          <Generic title={`Your Wallet Account ID: ${this.props.d.session.account.accountId()}`}>
            <h2>How to receive payments</h2>
            <p>To receive a payment from someone else, you share with them your account ID which <strong>begins with a G</strong>. You are only able to send funds inside your account ID.</p>

            <p>Your account ID is <strong>{this.props.d.session.account.accountId()}</strong></p>
            <p><strong>WARNING</strong>: Make sure the account ID you share belongs to you. If you give someone else the wrong account ID, the funds will be sent to the wrong account.</p>

            <div className="Generic__divider"></div>
            <h2>Where is the money stored?</h2>
            <p>In the Stellar network, funds exist on the network and can only be moved by whoever has the secret key. This means that your secret key is extremely sensitive, and whoever has access to it can move the funds.</p>

            <p>However, money is <strong>NOT</strong> actually <em>"inside"</em> StellarTerm. StellarTerm is just a helpful tool that helps you use your secret key to make transactions.</p>

            <p><strong>WARNING</strong>: Be extremely careful with your secret key and do not share it with anybody. Always check the url to make sure you are on the right website.</p>
            <div className="Generic__divider"></div>
            <h2>Accepting different kinds of assets</h2>
            By default, your account is only configured to accept <strong>XLM</strong>. In order to receive other assets, you must <a href="#account/addTrust">accept</a> them using the <strong>Accept assets</strong> tool.
          </Generic>
          <AccountView d={d}></AccountView>
        </ErrorBoundary>
      } else if (part1 === 'addTrust') {
        content = <ErrorBoundary>
          <Generic title="Assets in the Stellar Network">
            To receive assets on the Stellar network, you must first accept the asset.
            <br /><br />
            The Stellar network prevents spam by instituting a minimum balance that is similar to a refundable deposit. Each asset you accept increases your minimum balance.
          </Generic>
          <div className="so-back islandBack">
            <ManageCurrentTrust d={d}></ManageCurrentTrust>
          </div>
          <div className="so-back islandBack">
            <AddTrustFromFederation d={d}></AddTrustFromFederation>
          </div>
          <div className="so-back islandBack">
            <AddTrustFromDirectory d={d}></AddTrustFromDirectory>
          </div>
          <div className="so-back islandBack">
            <ManuallyAddTrust d={d}></ManuallyAddTrust>
          </div>
        </ErrorBoundary>
      } else if (part1 === 'send') {
        content = <ErrorBoundary>
          <div className="so-back islandBack islandBack--t">
            <Send d={d}></Send>
          </div>
        </ErrorBoundary>
      } else if (part1 === 'inflation') {
        content = <ErrorBoundary>
          <Inflation d={d}></Inflation>
        </ErrorBoundary>
      } else if (part1 === 'history') {
        content = <ErrorBoundary>
          <HistoryView d={d}></HistoryView>
        </ErrorBoundary>
      } else if (part1 === 'deposit') {
        content = (<div><Deposit d={d}/></div>);
      }

      return <div>
        <div className="subNavBackClipper">
          <div className="so-back subNavBack">
            <div className="so-chunk subNav">
              <nav className="subNav__nav">
                <a className="subNav__nav__item" href="#account">Balances</a>
                <a className="subNav__nav__item" href="#account/send">Send</a>
                <a className="subNav__nav__item" href="#account/addTrust">Accept assets</a>
                <a className="subNav__nav__item" href="#account/history">History</a>
                <a className="subNav__nav__item" href="#account/inflation">Inflation</a>
                {/*<a className="subNav__nav__item" href="#account/deposit">Deposit</a>*/}
              </nav>
            </div>
          </div>
        </div>
        {content}
      </div>
    }
  }
}

export default Session;
