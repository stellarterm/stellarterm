const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');

console.log(StellarSdk);

const TodoApp = React.createClass({
  render() {
    return (
      <div>Hello</div>
    );
  },
});

ReactDOM.render(<TodoApp />, mountNode);

