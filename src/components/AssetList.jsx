const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import Loading from './Loading.jsx';
import Printify from '../lib/Printify';
import directory from '../directory.js';
import Stellarify from '../lib/Stellarify';
import Format from '../lib/Format';
import _ from 'lodash';


export default class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenTicker(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.props.d.unlistenTicker(this.listenId);
  }
  render() {
    let d = this.props.d;
    if (!d.ticker.ready) {
      return <Loading size="large">Loading Stellar market data...</Loading>
    }

    let rows = [];
    _.each(d.ticker.assets, (asset, index) => {
      console.log(asset);
      console.log(Format)
      let sdkAsset = new StellarSdk.Asset(asset.code, asset.issuer);
      let priceXLM = asset.price_XLM ? Format.niceRound(asset.price_XLM): '-';
      let priceUSD = asset.price_USD ? '$' + Format.niceRound(asset.price_USD) : '-';
      if (asset.id == 'XLM-native') {
        priceXLM = Printify.lightenZeros('1.0000000');
      }
      let tradeLink;
      if (asset.topTradePairSlug) {
        tradeLink = <a href={'/#exchange/' + asset.topTradePairSlug}>trade</a>
      }
      let volume24h = asset.volume24h_USD ? '$' + asset.volume24h_USD.toFixed(0) : '$0';
      rows.push(<tr key={'asset-' + asset.id} className="AssetList__asset">
        <td className="AssetList__asset__assetCard"><AssetCard asset={sdkAsset} noLink={true}></AssetCard></td>
        <td className="AssetList__asset__amount">{priceXLM}{Printify.lighten(' XLM')}</td>
        <td className="AssetList__asset__amount">{priceUSD}</td>
        <td className="AssetList__asset__amount">{volume24h}</td>
        <td className="AssetList__asset__amount">{tradeLink}</td>
      </tr>);
      // rows.push(<AssetPair key={index} row={true} baseBuying={market.baseBuying} counterSelling={market.counterSelling}></AssetPair>)
    })
    return (
      <table className="AssetList">
        <thead>
          <tr>
            <td className="AssetList__head__cell AssetList__head__asset">Asset</td>
            <td className="AssetList__head__amount AssetList__head__cell">Price (XLM)</td>
            <td className="AssetList__head__amount AssetList__head__cell">Price (USD)</td>
            <td className="AssetList__head__amount AssetList__head__cell">Volume (24h)</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
};
