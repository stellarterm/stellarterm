const React = window.React = require('react');
import AssetCard2 from './AssetCard2.jsx';
import Loading from './Loading.jsx';
import Ellipsis from './Ellipsis.jsx';
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
      return <Loading size="large">Loading Stellar market data<Ellipsis /></Loading>
    }

    let rows = [];
    _.each(this.dTicker.data.assets, (asset, index) => {
      if (this.props.limit && index >= this.props.limit) {
        return;
      }
      let directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);
      if (directoryAsset === null || directoryAsset.unlisted) {
        // Don't show unlisted assets
        return;
      }

      let priceXLM = asset.price_XLM ? Printify.lightenZeros(asset.price_XLM.toString(), Format.niceNumDecimals(asset.price_XLM)): '-';
      let priceUSD = asset.price_USD ? <span>${Printify.lightenZeros(asset.price_USD.toString(), Format.niceNumDecimals(asset.price_USD))}</span> : '-';
      if (asset.id == 'XLM-native') {
        priceXLM = Printify.lightenZeros('1.0000000');
      }
      let tradeLink;
      if (asset.topTradePairSlug) {
        tradeLink = <span className="AssetList__asset__amount__trade">trade</span>
      }
      let volume24h = asset.volume24h_USD ? '$' + asset.volume24h_USD.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0}) : '$0';

      let change24hPercentage;
      if (asset.id === 'XLM-native') {
        change24hPercentage = this.dTicker.data._meta.externalPrices.USD_XLM_change;
      } else {
        change24hPercentage = asset.change24h_USD;
      }

      let change24h;
      if (change24hPercentage === null || change24hPercentage === undefined) {
        change24h = '-';
      } else if (change24hPercentage < 0) {
        change24h = <span className="AssetList__asset__changeNegative">{change24hPercentage.toFixed(2)}%</span>;
      } else {
        change24h = <span className="AssetList__asset__changePositive">{change24hPercentage.toFixed(2)}%</span>;
      }

      rows.push(<a href={'#exchange/' + asset.topTradePairSlug} key={'asset-' + asset.id} className="AssetList__asset">
        <div className="AssetList__asset__assetCard"><AssetCard2 code={asset.code} issuer={asset.issuer} boxy={false}></AssetCard2></div>
        <div className="AssetList__asset__amount">{priceXLM}{Printify.lighten(' XLM')}</div>
        <div className="AssetList__asset__amount">{priceUSD}</div>
        <div className="AssetList__asset__amount">{volume24h}</div>
        <div className="AssetList__asset__amount">{change24h}</div>
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
          <div className="AssetList__head__cell AssetList__head__amount">Change (24h)</div>
        </div>
        {rows}
      </div>
    );
  }
};
