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
import images from './images';

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
      body = <div>
        <div className="so-back">
          <h2 className="HomePage__lead">Explore the power of the Stellar distributed exchange</h2>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <div className="island__sub">
              <div className="island__sub__division HomePage__introImage">
                <a href="#exchange/XLM-native/DEMO-stellarterm.com"><img className="HomePage__screenshot" src={images.charts} /></a>
              </div>
              <div className="island__sub__division">
                <div className="HomePage__sideBlurb">
                  Explore markets on the Stellar distributed exchange through interactive graphs and user friendly charts.
                  <br />
                  <br />
                  <div className="HomePage__buttonContainer">
                    <a className="s-button" href="#exchange/XLM-native/DEMO-stellarterm.com">View exchange demo</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <h3 className="HomePage__sectionTitle">Make trades and send payments</h3>
            <div className="island__sub">
              <div className="island__sub__division HomePage__introImage">
                <img className="HomePage__screenshot" src={images.order} />
              </div>
              <div className="island__sub__division HomePage__introImage">
                <img className="HomePage__screenshot" src={images.send} />
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
