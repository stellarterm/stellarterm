const React = window.React = require('react');
import LoginForm from './Session/LoginForm.jsx';
import AccountView from './Session/AccountView.jsx';
import ManuallyAddTrust from './Session/ManuallyAddTrust.jsx';
import Generic from './Generic.jsx';
import AddTrustFromDirectory from './Session/AddTrustFromDirectory.jsx';

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
        content = <div className="so-back islandBack islandBack--t">
          <AddTrustFromDirectory d={d}></AddTrustFromDirectory>
          <ManuallyAddTrust d={d}></ManuallyAddTrust>
        </div>
      }

      return <div>
        {content}
      </div>
    }
  }
}

export default Session;
