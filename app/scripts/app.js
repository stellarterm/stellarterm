var React = window.React = require('react')
var ReactDOM = require('react-dom')
var Timer = require('./ui/Timer')
var mountNode = document.getElementById('app')

console.log(StellarSdk);

var TodoApp = React.createClass({
  render: function () {
    return (
      <div>
        <Timer />
      </div>
    )
  }
})

ReactDOM.render(<TodoApp />, mountNode)

