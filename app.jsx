const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
const Printify = require('./lib/Printify');

const Offers = require('./components/Offers.jsx');
const Server = new StellarSdk.Server('https://horizon.stellar.org');

let baseBuying = new StellarSdk.Asset('XLM', null);
let counterSelling = new StellarSdk.Asset('USD', 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE');
Server.orderbook(baseBuying, counterSelling)
  .call()
  .then(res => {
    const TodoApp = React.createClass({
      render() {
        return (
          <div>
            <div>
              <p>Base currency: {Printify.assetName(baseBuying)} {baseBuying.getIssuer()}</p>
              <p>Counter currency: {Printify.assetName(counterSelling)} {counterSelling.getIssuer()}</p>
            </div>
            <Offers orderbookDetails={res}></Offers>
          </div>
        );
      },
    });

    ReactDOM.render(<TodoApp />, mountNode);
  })
