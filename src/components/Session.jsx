const React = window.React = require('react');
import LoginForm from './Session/LoginForm.jsx';

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.d = this.props.driver;

    this.listenId = this.d.listenSession(() => {
      console.log('helloooo')
      this.forceUpdate();
    });

    // Static functions
    this.handlers = this.props.driver.handlers;
    this.logIn = this.props.driver.handlers.logIn;
  }
  componentWillUnmount() {
    this.d.unlistenSession(this.listenId);
  }
  render() {
    let state = this.d.session.state;
    console.log(state)
    if (state === 'out') {
      return <LoginForm handler={this.logIn}></LoginForm>
    } else if (state === 'loading') {
      return <div><p>Loading</p></div>
    } else if (state === 'in') {
      return <div>Logged in as: {this.d.session.accountId}</div>
    }
  }
}

export default Session;
