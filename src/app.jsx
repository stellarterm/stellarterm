const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import OfferTables from './components/OfferTables.jsx';
import OfferMakers from './components/OfferMakers.jsx';
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
    this.d = props.d;
  }
  render() {
    return (
      <div>
        <Session d={this.d}></Session>
        <div>
          <p>Base currency: {this.d.baseBuyingAssetName()} {this.d.baseBuyingGetIssuer()}</p>
          <p>Counter currency: {this.d.counterSellingAssetName()} {this.d.counterSellingGetIssuer()}</p>
        </div>
        <OfferMakers d={this.d}></OfferMakers>
        <OfferTables d={this.d}></OfferTables>
      </div>
    );
  }
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
