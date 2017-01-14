const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import OfferTables from './components/OfferTables.jsx';
import OfferMakers from './components/OfferMakers.jsx';
import Session from './components/Session.jsx';
import PairPicker from './components/PairPicker.jsx';

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
    this.d = props.d;
  }
  render() {
    return (
      <div>
        <div className="island">
          <div className="island__header">
            Account
          </div>
          <Session d={this.d}></Session>
        </div>
        <div className="island">
          <PairPicker d={this.d}></PairPicker>
        </div>
        <div className="island">
          <div className="island__header">
            Orderbook
          </div>
          <OfferMakers d={this.d}></OfferMakers>
          <div className="island__separator"></div>
          <OfferTables d={this.d}></OfferTables>
        </div>
      </div>
    );
  }
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
