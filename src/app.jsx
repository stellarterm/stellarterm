const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import OfferTables from './components/OfferTables.jsx';
import OfferMakers from './components/OfferMakers.jsx';
import Session from './components/Session.jsx';
import PairPicker from './components/PairPicker.jsx';
import url from 'url';

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


const parseUrl = (href) => {
  let hash = url.parse(href).hash;
  if (hash === null) {
    return '';
  }
  return hash.substr(1);
}

class TermApp extends React.Component {
  constructor(props) {
    super(props);
    this.d = props.d;
    this.state = {
      // The url is the hash cleaned up
      url: parseUrl(window.location.href)
    };
    window.addEventListener('hashchange', (e) => {
      this.setState({
        url: parseUrl(e.newURL)
      })
    } , false);
  }
  render() {
    let url = this.state.url;
    if (url === '') {
      // Home page
      return <div>
        Welcome to stellarterm.com
      </div>
    } else if (url === 'account') {
      return <div className="island">
        <div className="island__header">
          Account
        </div>
        <Session d={this.d}></Session>
      </div>
    } else if (url === 'trading') {
      return <div>
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
      </div>;
    }

    return <div>Page not found</div>
  }
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
