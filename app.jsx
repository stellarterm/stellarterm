const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');

const OffersTable = require('./components/OffersTable.jsx');

console.log(StellarSdk);

const TodoApp = React.createClass({
  render() {
    return (
      <div>Hello
        <OffersTable></OffersTable>
      </div>
    );
  },
});

ReactDOM.render(<TodoApp />, mountNode);

