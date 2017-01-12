const React = window.React = require('react');

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: 'SBF33P2MQEWAIZE3VZRUBRYREQHTECUWQ24L2HH4XDVVXIPH57JB2G3H',
    }

    this.handleInput = (event) => {
      this.setState({secretInput: event.target.value});
    }
    this.handleSubmit = (event) => {
      event.preventDefault();
      this.props.handler(this.state.secretInput);
    }
  }

  render() {
    return <div>
      <form onSubmit={this.handleSubmit}>
        <input type="text" value={this.state.secretInput} onChange={this.handleInput} placeholder="Secret key" />
        <input type="submit" value="Log in"></input>
      </form>
    </div>
  }
}
