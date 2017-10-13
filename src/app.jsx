const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import NotFound from './components/NotFound.jsx';
import AssetList from './components/AssetList.jsx';
import Markets from './components/Markets.jsx';
import Session from './components/Session.jsx';
import Exchange from './components/Exchange.jsx';
import Generic from './components/Generic.jsx';
import Stellarify from './lib/Stellarify';
import url from 'url';
import Header from './components/Header.jsx';
import Driver from './lib/Driver';
import images from './images';

let network = {
  horizonUrl: 'https://horizon.stellar.org',
  networkPassphrase: StellarSdk.Networks.PUBLIC,
  isDefault: true, // If it's default, then we don't show a notice bar at the top
};

if (window.location.hash === '#testnet') {
  window.location.hash = '';
  network.isDefault = false;
  network.horizonUrl = 'https://horizon-testnet.stellar.org';
  network.networkPassphrase = StellarSdk.Networks.TESTNET;
} else if (window.stCustomConfig.horizonUrl) {
  network.isDefault = false;
  network.horizonUrl = window.stCustomConfig.horizonUrl;
  if (window.stCustomConfig.networkPassphrase) {
    network.networkPassphrase = window.stCustomConfig.networkPassphrase;
  }
}

StellarSdk.Network.use(new StellarSdk.Network(network.networkPassphrase));

let driver = new Driver({
  network,
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
      if (e.newURL.indexOf('/#testnet') !== -1) {
        window.location.reload();
      }
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
      body = <div>
        <div className="HomePage__black">
          <div className="so-back">
            <div className="HomePage__lead">
              <h2 className="HomePage__lead__title">Stellar Distributed Exchange</h2>
              <p>A trading platform that enables near-instant trades between any asset on the Stellar network</p>
            </div>
          </div>
        </div>
        <div className="so-back islandBack HomePage__assetList">
          <div className="island">
            <AssetList d={this.props.d} limit={5}></AssetList>
            <div className="HomePage__seeMore">
              View more assets on the <a href="#markets">market list page</a>.
            </div>
          </div>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <h3 className="HomePage__sectionTitle">Make trades and send payments</h3>
            <div className="island__sub">
              <div className="island__sub__division HomePage__introImage">
                <a href="#exchange"><img className="HomePage__screenshot" src={images.order} /></a>
              </div>
              <div className="island__sub__division HomePage__introImage">
                <a href="#account"><img className="HomePage__screenshot" src={images.send} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <div className="island__sub">
              <div className="island__sub__division HomePage__introImage">
                <a href="https://github.com/irisli/stellarterm"><img className="HomePage__screenshot" src={images.github} /></a>
              </div>
              <div className="island__sub__division">
                <div className="HomePage__sideBlurb">
                  <p>StellarTerm is just a client that can be used to access the Stellar distributed exchange. Neither StellarTerm nor the developers of it are involved with operating the Stellar network.</p>
                  <p>StellarTerm is open source software. To support the project, please <a href="https://github.com/irisli/stellarterm">star the project on GitHub</a>.</p>
                  <p>StellarTerm is developed by <a href="https://iris.li/">Iris Li</a>, a former employee of the Stellar Development Foundation. The project is independent of the Stellar Development Foundation.</p>
                  <p>The project is released under the Apache-2.0 license and is released as is without warranty.</p>
                </div>
              </div>
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
          console.error(e);
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
          // Default to a market with good activity
          let baseBuying = StellarSdk.Asset.native();
          let counterSelling = new StellarSdk.Asset('CNY', 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX');

          this.d.handlers.setOrderbook(baseBuying, counterSelling);
          setTimeout(() => {
            let newUrl = Stellarify.pairToExchangeUrl(baseBuying, counterSelling);
            history.replaceState(null, null, '#' + newUrl);
            this.setState({
              url: newUrl,
            })
          }, 0);
        }
      }
    } else {
      body = <NotFound></NotFound>
    }

    return <div>
      <Header d={this.props.d} urlParts={urlParts} network={network}></Header>
      {body}
    </div>;

  }
};

ReactDOM.render(<TermApp d={driver} />, mountNode);
