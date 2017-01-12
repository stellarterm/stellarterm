const React = window.React = require('react');
import LoginForm from './Session/LoginForm.jsx';
import AccountView from './Session/AccountView.jsx';

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
    this.d.unlistenSession(this.listenId);
  }
  render() {
    let d = this.props.d;
    let state = d.session.state;
    if (state === 'out') {
      return <LoginForm handler={this.logIn}></LoginForm>
    } else if (state === 'loading') {
      return <div><p>Loading</p></div>
    } else if (state === 'in') {
      return <AccountView session={d.session}></AccountView>
    }

  }
}

export default Session;
