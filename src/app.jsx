const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import NotFound from './components/NotFound.jsx';
import Markets from './components/Markets.jsx';
import Session from './components/Session.jsx';
import Exchange from './components/Exchange.jsx';
import Generic from './components/Generic.jsx';
import Stellarify from './lib/Stellarify';
import url from 'url';
import Header from './components/Header.jsx';
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
useLiveNetwork();
// useTestNetwork();

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
    let urlParts = url.split('/');

    let body;
    if (url === '') {
      // Home page
      body = <div className="so-back islandBack">
        <h2 className="HomePage__lead">Explore the power of the Stellar distributed exchange</h2>
        <div className="island">
          <div className="island__sub">
            <div className="island__sub__division HomePage__introImage">
            <img className="HomePage__screenshot" src="./900500.png" />
            </div>
            <div className="island__sub__division">
              Interactive graphs of the markets on the Stellar distributed exchange.
              <br />
              <br />
              <div className="HomePage__buttonContainer">
              <a className="s-button" href="#exchange/XLM-native/DEMO-stellarterm.com">View exchange demo</a>
              </div>
            </div>
          </div>
          <div className="island__separator"></div>
          <div className="island__sub">
            <div className="island__sub__division HomePage__introImage">
              Picture
            </div>
            <div className="island__sub__division">
              Make trades and manage your account. You can also edit trustlines and send payments.
            </div>
          </div>
          <div className="island__separator"></div>
          <div className="island__sub">
            <div className="island__sub__division HomePage__introImage">
              Picture
            </div>
            <div className="island__sub__division">
              StellarTerm is open source and released under the Apache 2.0 license. To support the project, please <a href="https://github.com/irisli/stellarterm">star the project on GitHub</a>.
              It is developed by <a href="https://iris.li/">Iris Li</a>, a former employee of the Stellar Development Foundation. The project is independent of the Stellar Development Foundation.
            </div>
          </div>
        </div>
      </div>
    } else if (urlParts[0] === 'account') {
      body = <Session d={this.d} urlParts={urlParts}></Session>
    } else if (urlParts[0] === 'markets') {
      body = <Markets d={this.d}></Markets>
    } else if (urlParts[0] === 'exchange') {
      if (urlParts.length === 3) {
        try {
          let baseBuying = Stellarify.parseAssetSlug(urlParts[1]);
          let counterSelling = Stellarify.parseAssetSlug(urlParts[2]);

          this.d.handlers.setOrderbook(baseBuying, counterSelling);
          body = <Exchange d={this.d}></Exchange>
        } catch (e) {
          console.log(e.message);
          body = <Generic title="Pick a market">Exchange url was invalid. To begin, go to the <a href="#markets">market list page</a> and pick a trading pair.</Generic>
        }
      } else {
        if (this.d.orderbook.ready) {
          setTimeout(() => {
            let newUrl = Stellarify.pairToExchangeUrl(this.d.orderbook.baseBuying, this.d.orderbook.counterSelling);
            history.replaceState(null, null, '#' + newUrl);
            this.setState({
              url: newUrl,
            })
          }, 0);
          body = <Generic title="Loading orderbook">Loading</Generic>
        } else {
          body = <Generic title="Pick a market">To begin, go to the <a href="#markets">market list page</a> and pick a trading pair.</Generic>
        }
      }
    } else {
      body = <NotFound></NotFound>
    }

    return <div>
      <Header d={this.props.d} urlParts={urlParts}></Header>
      {body}
    </div>;

  }
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
