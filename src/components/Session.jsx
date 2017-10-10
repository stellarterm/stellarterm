const React = window.React = require('react');
import LoginForm from './Session/LoginForm.jsx';
import AccountView from './Session/AccountView.jsx';
import ManageCurrentTrust from './Session/ManageCurrentTrust.jsx';
import ManuallyAddTrust from './Session/ManuallyAddTrust.jsx';
import AddTrustFromFederation from './Session/AddTrustFromFederation.jsx';
import AddTrustFromDirectory from './Session/AddTrustFromDirectory.jsx';
import Send from './Session/Send.jsx';
import Generic from './Generic.jsx';

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenSession(() => {
      this.forceUpdate();
    });

    // Static functions from driver
    this.handlers = this.props.d.handlers;
    this.logIn = this.props.d.handlers.logIn;
  }
  componentWillUnmount() {
    this.props.d.unlistenSession(this.listenId);
  }
  render() {
    let d = this.props.d;
    let state = d.session.state;
    let setupError = d.session.setupError;
    if (state === 'out') {
      return <LoginForm setupError={setupError} handler={this.logIn}></LoginForm>
    } else if (state === 'loading') {
      return <Generic title="Loading account">Loading account</Generic>
    } else if (state === 'in') {
      let content;
      let part1 = this.props.urlParts[1];
      if (part1 === undefined) {
        content = <div className="so-back islandBack islandBack--t">
          <AccountView d={d}></AccountView>
        </div>
      } else if (part1 === 'addTrust') {
        content = <div>
          <Generic title="Assets in the Stellar Network">
            To use assets on the Stellar Network, an account must "accept" that asset first.
            Additionally, the Stellar Network prevents spam by instituting a minimum balance that is similar to a refundable deposit. Each asset you accept increases your minimum balance.
          </Generic>
          <div className="so-back islandBack">
            <ManageCurrentTrust d={d}></ManageCurrentTrust>
          </div>
          <div className="so-back islandBack">
            <AddTrustFromDirectory d={d}></AddTrustFromDirectory>
          </div>
          <div className="so-back islandBack">
            <AddTrustFromFederation d={d}></AddTrustFromFederation>
          </div>
          <div className="so-back islandBack">
            <ManuallyAddTrust d={d}></ManuallyAddTrust>
          </div>
        </div>
      } else if (part1 === 'send') {
        content = <div>
          <div className="so-back islandBack islandBack--t">
            <Send d={d}></Send>
          </div>
        </div>
      }

      return <div>
        <div className="subNavBackClipper">
          <div className="so-back subNavBack">
            <div className="so-chunk subNav">
              <nav className="subNav__nav">
                <a className="subNav__nav__item" href="#account">Balances</a>
                <a className="subNav__nav__item" href="#account/send">Send</a>
                <a className="subNav__nav__item" href="#account/addTrust">Manage assets</a>
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
