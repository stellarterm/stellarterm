const React = window.React = require('react');

class Session extends React.component {
  render() {
    return <div>
      <input type="text" placeholder="Secret key" />
      <button>Log in</button>
    </div>
  }
}

export default Session;
