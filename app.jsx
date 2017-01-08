const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
const Offers = require('./components/Offers.jsx');

const Driver = require('./lib/Driver');

let driver = new Driver({
  horizonUrl: 'https://horizon.stellar.org',
});

driver.getOrderbook()
  .then(res => {
    const TodoApp = React.createClass({
      render() {
        return (
          <div>
            <div>
              <p>Base currency: {driver.baseBuyingAssetName()} {driver.baseBuyingGetIssuer()}</p>
              <p>Counter currency: {driver.counterSellingAssetName()} {driver.counterSellingGetIssuer()}</p>
            </div>
            <Offers orderbookDetails={res} driver={driver}></Offers>
          </div>
        );
      },
    });

    ReactDOM.render(<TodoApp />, mountNode);
  })
