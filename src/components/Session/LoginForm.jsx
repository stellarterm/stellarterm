const React = window.React = require('react');

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: 'SCTTKASS24XPXL6V4AS6VSVCL6VOM3OXEO4JGUQASGXVIG5CRGTMDKH6',
    }

    this.handleInput = (event) => {
      this.setState({secretInput: event.target.value});
    }
    this.handleSubmit = (event) => {
      console.log(this.props.handler)
      this.props.handler(this.state.secretInput);
      event.preventDefault();
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
