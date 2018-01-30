const React = window.React = require('react');
import AssetCard2 from './AssetCard2.jsx';
import Loading from './Loading.jsx';
import Printify from '../lib/Printify';
import directory from '../directory.js';
import Stellarify from '../lib/Stellarify';
import Format from '../lib/Format';
import _ from 'lodash';


export default class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.dTicker = props.d.ticker;
    this.listenId = this.dTicker.event.listen(() => {this.forceUpdate()});
  }
  componentWillUnmount() {
    this.dTicker.event.unlisten(this.listenId);
  }
  render() {
    if (!this.dTicker.ready) {
      return <Loading size="large">Loading Stellar market data...</Loading>
    }

    let rows = [];
    _.each(this.dTicker.data.assets, (asset, index) => {
      if (this.props.limit && index >= this.props.limit) {
        return;
      }
      let priceXLM = asset.price_XLM ? Format.niceRound(asset.price_XLM): '-';
      let priceUSD = asset.price_USD ? '$' + Format.niceRound(asset.price_USD) : '-';
      if (asset.id == 'XLM-native') {
        priceXLM = Printify.lightenZeros('1.0000000');
      }
      let tradeLink;
      if (asset.topTradePairSlug) {
        tradeLink = <span className="AssetList__asset__amount__trade">trade</span>
      }
      let volume24h = asset.volume24h_USD ? '$' + asset.volume24h_USD.toFixed(0) : '$0';
      rows.push(<a href={'#exchange/' + asset.topTradePairSlug} key={'asset-' + asset.id} className="AssetList__asset">
        <div className="AssetList__asset__assetCard"><AssetCard2 code={asset.code} issuer={asset.issuer} boxy={false}></AssetCard2></div>
        <div className="AssetList__asset__amount">{priceXLM}{Printify.lighten(' XLM')}</div>
        <div className="AssetList__asset__amount">{priceUSD}</div>
        <div className="AssetList__asset__amount">{volume24h}</div>
        <div className="AssetList__asset__amount">{tradeLink}</div>
      </a>);
      // rows.push(<AssetPair key={index} row={true} baseBuying={market.baseBuying} counterSelling={market.counterSelling}></AssetPair>)
    })
    return (
      <div className="AssetList">
        <div className="AssetList__head__row">
          <div className="AssetList__head__cell AssetList__head__asset">Asset</div>
          <div className="AssetList__head__cell AssetList__head__amount">Price (XLM)</div>
          <div className="AssetList__head__cell AssetList__head__amount">Price (USD)</div>
          <div className="AssetList__head__cell AssetList__head__amount">Volume (24h)</div>
        </div>
        {rows}
      </div>
    );
  }
};
