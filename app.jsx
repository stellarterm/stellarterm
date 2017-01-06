const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');

const Offers = require('./components/Offers.jsx');
const Server = new StellarSdk.Server('https://horizon.stellar.org');

let buying = new StellarSdk.Asset('XLM', null);
let selling = new StellarSdk.Asset('USD', 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE');
Server.orderbook(selling, buying)
  .call()
  .then(res => {
    const TodoApp = React.createClass({
      render() {
        return (
          <div>Hello
            <Offers orderbookDetails={res}></Offers>
          </div>
        );
      },
    });

    ReactDOM.render(<TodoApp />, mountNode);
  })
