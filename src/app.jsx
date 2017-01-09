const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import Offers from './components/Offers.jsx';
import Session from './components/Session.jsx';

import Driver from './lib/Driver';

let network = {};

let useLiveNetwork = () => {
  network.horizonUrl = 'https://horizon.stellar.org';
  StellarSdk.Network.usePublicNetwork();
}
let useTestNetwork = () => {
  network.horizonUrl = 'https://horizon-testnet.stellar.org';
  StellarSdk.Network.useTestNetwork();
}
useTestNetwork();

let driver = new Driver({
  horizonUrl: network.horizonUrl,
});

class TermApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderbook: undefined,
    };

    this.driver = props.driver;
    this.driver.getOrderbook()
    .then(res => {
      this.setState({
        orderbook: res,
      })
    })
  }
  render() {
    return (
      <div>
        <Session driver={driver}></Session>
        <div>
          <p>Base currency: {driver.baseBuyingAssetName()} {driver.baseBuyingGetIssuer()}</p>
          <p>Counter currency: {driver.counterSellingAssetName()} {driver.counterSellingGetIssuer()}</p>
        </div>
        <Offers orderbookDetails={this.state.orderbook}></Offers>
      </div>
    );
  }
};

ReactDOM.render(<TermApp driver={driver} />, mountNode);
