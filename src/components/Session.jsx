const React = window.React = require('react');
import LoginForm from './Session/LoginForm.jsx';
import AccountView from './Session/AccountView.jsx';
import AddTrust from './Session/AddTrust.jsx';

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
    if (state === 'out') {
      return <LoginForm handler={this.logIn}></LoginForm>
    } else if (state === 'loading') {
      return <div><p>Loading</p></div>
    } else if (state === 'in') {
      let content;
      let part1 = this.props.urlParts[1];
      if (part1 === undefined) {
        content = <AccountView d={d}></AccountView>
      } else if (part1 === 'addTrust') {
        content = <AddTrust d={d}></AddTrust>
      }

      return <div>
        <div className="so-back subNavBack">
          <div className="so-chunk subNav">
            <nav className="subNav__nav">
              <a className="subNav__nav__item" href="#account">Balances</a>
              <a className="subNav__nav__item" href="#account/addTrust">Add trust</a>
            </nav>
          </div>
        </div>
        {content}
      </div>
    }
  }
}

export default Session;
