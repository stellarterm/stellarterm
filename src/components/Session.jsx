const React = window.React = require('react');

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      secretInput: 'SCTTKASS24XPXL6V4AS6VSVCL6VOM3OXEO4JGUQASGXVIG5CRGTMDKH6',
    }

    this.handleInput = (event) => {
      this.setState({secretInput: event.target.value});
    }
    this.handleSubmit = (event) => {
      this.props.handlers.logIn(this.state.secretInput);
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

export default Session;
