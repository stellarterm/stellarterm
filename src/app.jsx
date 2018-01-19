const React = window.React = require('react');
const ReactDOM = require('react-dom');
const mountNode = document.getElementById('app');
import NotFound from './components/NotFound.jsx';
import AssetList from './components/AssetList.jsx';
import Markets from './components/Markets.jsx';
import Session from './components/Session.jsx';
import Exchange from './components/Exchange.jsx';
import Generic from './components/Generic.jsx';
import Loading from './components/Loading.jsx';
import Stellarify from './lib/Stellarify';
import url from 'url';
import Header from './components/Header.jsx';
import Driver from './lib/Driver';
import images from './images';

let network = {
  horizonUrl: 'https://horizon.stellar.org',
  networkPassphrase: StellarSdk.Networks.PUBLIC,
  isDefault: true, // If it's default, then we don't show a notice bar at the top
  isTestnet: false,
  isCustom: false,
};

if (window.location.hash === '#testnet') {
  network.isDefault = false;
  network.isTestnet = true;
  network.horizonUrl = 'https://horizon-testnet.stellar.org';
  network.networkPassphrase = StellarSdk.Networks.TESTNET;
} else if (window.stCustomConfig.horizonUrl) {
  network.isDefault = false;
  network.isCustom = true;
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
            <div className="HomePage__forSaleContainer">
              <p className="HomePage__forSale">
                StellarTerm.com is for sale. More <a href="#sale">details on the sale page</a>.
                <br />
                For now, StellarTerm will continue to operate normally.
              </p>
            </div>
            <div className="HomePage__lead">
              <h2 className="HomePage__lead__title">Trade on the <a href="https://www.stellar.org/developers/guides/concepts/exchange.html">Stellar Distributed Exchange</a></h2>
              <p className="HomePage__lead__summary">StellarTerm is an <a href="https://github.com/irisli/stellarterm">open source</a> client for the <a href="https://www.stellar.org/">Stellar network</a>. <br />Send, receive, and <a href="#exchange">trade</a> assets on the Stellar network easily with StellarTerm.</p>
            </div>
          </div>
        </div>
        <div className="so-back islandBack HomePage__assetList">
          <div className="island">
            <AssetList d={this.props.d} limit={6}></AssetList>
            <div className="HomePage__seeMore">
              View more assets on the <a href="#markets">market list page</a>.
            </div>
          </div>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <div className="island__sub">
              <div className="island__sub__division">
                <div className="HomePage__sideBlurb">
                  <p>StellarTerm is just a client that can be used to access the Stellar distributed exchange. Neither StellarTerm nor the developers of it are involved with operating the Stellar network.</p>
                  <p>StellarTerm is developed by <a href="https://iris.li/">Iris Li</a>, a former employee of the Stellar Development Foundation. The project is independent of the Stellar Development Foundation.</p>
                </div>
              </div>
              <div className="island__sub__division">
                <div className="HomePage__sideBlurb">
                  <p>StellarTerm is open source software. To support the project, please <a href="https://github.com/irisli/stellarterm">star the project on GitHub</a>.</p>
                  <p>The project is released under the Apache-2.0 license and is released as is without warranty.</p>
                  <p><a href="#privacy">Privacy policy</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    } else if (urlParts[0] === 'sale') {
        body = <div className="Sale">
          <div className="Sale__intro so-back">
            <div className="Sale__intro__content so-chunk">
              <p>StellarTerm is the most popular trading client on the Stellar network.
              <br />The author of StellarTerm is looking to sell this domain.</p>
            </div>
          </div>
          <div className="island">
            <div className="Sale__section">
              <h2>What you get</h2>
              <p>
                <ul>
                  <li>StellarTerm.com domain name</li>
                  <li>Social media accounts for Twitter and Facebook</li>
                  <li>GitHub organization: github.com/stellarterm</li>
                  <li>Relevant AWS items</li>
                </ul>
              </p>
            </div>
            <div className="Sale__section">
              <h2>Analytics</h2>
              <p>StellarTerm currently uses Cloudflare. Here is a screenshot from the analytics dashboard. This is just for informational purposes and is not a guarantee that StellarTerm will see this many users in the future.</p>
              <br />
              <img alt="StellarTerm" className="Sale__analytics" src="https://user-images.githubusercontent.com/5728307/35127936-19f80e40-fc69-11e7-8cd0-dee25270e822.png" />
            </div>
            <div className="Sale__section">
              <h2>Currently open source</h2>
              <p>The code behind StellarTerm is currently open source and licensed under the Apache-2.0 license. Anyone can use and make modifications to the code however they like.</p>
              <p>The purchaser has the right to keep source changes private. The purchaser may also completely change the website.</p>
            </div>
            <div className="Sale__section">
              <h2>Details</h2>
              <p>
                <ul>
                  <li>Must be a known entity in the cryptocurrency space. I will not sell this site to a scammer.</li>
                  <li>Serious offers only.</li>
                  <li>Other details are negotiable.</li>
                </ul>
              </p>
            </div>
            <div className="Sale__section">
              <h2>Stipulations</h2>
              <p>
                <ul>
                  <li>Developer support is NOT included. (Negotiable)</li>
                  <li>The sale does not come with any warranty other than successful transfer of what is listed under "What you get".</li>
                  <li>You must maintain clear indication that the ownership is different.</li>
                  <li>Source code not for sale, but is still Apache-2.0. You get rights to copy, modify, and redistribute under any software license.</li>
                </ul>
              </p>
            </div>
            <div className="Sale__section">
              <h2>Contact</h2>
              <p>The contact information for the seller is available at <a href="https://iris.li/">https://iris.li/</a></p>
            </div>
          </div>
        </div>
    } else if (urlParts[0] === 'testnet') {
      if (network.isTestnet) {
        body = <Generic title="Test network">
          You are running on the <a href="https://www.stellar.org/developers/guides/concepts/test-net.html">Stellar test network</a>. This network is for development purposes only and the test network may be occasionally reset.
          <br />
          To create a test account on the test network, use the <a href="https://www.stellar.org/laboratory/#account-creator?network=test">Friendbot to get some test lumens</a>.
        </Generic>
      } else {
        body = <Generic title="Please refresh the page to switch to testnet"><Loading darker={true}>
          Please refresh the page to switch to testnet.
        </Loading></Generic>
      }
    } else if (urlParts[0] === 'privacy') {
      body = <Generic title="Privacy Policy">
        <p>StellarTerm does not track you. StellarTerm does not store cookies and the website does not contain any analytics scripts. StellarTerm developers never see your public or private keys.</p>
        <p>However, StellarTerm.com is hosted on GitHub, AWS, and Cloudflare infrastructure. They may and do have their own tracking systems on their servers. Those services have their own privacy policies and is not covered by this privacy policy.</p>
        <p>Lastly, just because StellarTerm does not track you, it does not mean your actions are private. Take note of other privacy issues that may affect you:</p>
        <ul>
          <li>Stellar is a public ledger. Anyone can see anything that happens on the network.</li>
          <li>Your computer might be compromised.</li>
          <li>The StellarTerm website might be compromised.</li>
        </ul>
      </Generic>
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
