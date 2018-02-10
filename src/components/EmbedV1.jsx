const React = window.React = require('react');
import _ from 'lodash';
import AssetCard2 from './AssetCard2.jsx';
import PriceChart from './PriceChart.jsx';
const Format = require('../lib/Format');
import Stellarify from '../lib/Stellarify';
import Ellipsis from './Ellipsis.jsx';
import directory from '../directory';
import Loading from './Loading.jsx';

export default class EmbedV1 extends React.Component {
  constructor(props) {
    super(props);
    let initializedOrderbook = false;
    this.assetObj = Stellarify.parseAssetSlug(props.urlParts[2]);

    var root = document.documentElement;
    root.className += ' EmbedV1HTML';

    this.unsubTicker = this.props.d.ticker.event.sub(() => {
      let ticker = this.props.d.ticker;
      this.forceUpdate();

      if (ticker.ready && initializedOrderbook === false) {
        initializedOrderbook = true;
        let tickerAsset = _.find(ticker.data.assets, {
          code: this.assetObj.code,
          issuer: this.assetObj.issuer,
        });

        let pair = tickerAsset.topTradePairSlug.split('/');
        let baseAssetByDomain = pair[0].split('-');
        let counterAssetByDomain = pair[1].split('-');

        this.baseAssetByIssuer = directory.getAssetByDomain(baseAssetByDomain[0], baseAssetByDomain[1])
        this.counterAssetByIssuer = directory.getAssetByDomain(counterAssetByDomain[0], counterAssetByDomain[1])

        this.baseBuying = new StellarSdk.Asset(this.baseAssetByIssuer.code, this.baseAssetByIssuer.issuer);
        this.counterSelling = new StellarSdk.Asset(this.counterAssetByIssuer.code, this.counterAssetByIssuer.issuer);

        this.props.d.orderbook.handlers.setOrderbook(this.baseBuying, this.counterSelling);
      }
    });
    this.unsubOrderbook = this.props.d.orderbook.event.sub(() => {this.forceUpdate()});
  }
  componentWillUnmount() {
    this.unsubTicker();
  }
  render() {
    try {
      let urlParts = this.props.urlParts;
      let ticker = this.props.d.ticker;

      if (!ticker.ready) {
        return <div className="EmbedV1"><Loading size="large">Loading ticker data<Ellipsis /></Loading></div>
      }

      if (!this.props.d.orderbook.data.ready) {
        return <div className="EmbedV1"><Loading size="large">Loading orderbook<Ellipsis /></Loading></div>
      }


      let baseNative = this.baseBuying.isNative();
      let counterNative = this.counterSelling.isNative();
      let currentPrice;
      if (baseNative || counterNative) {
        let dataRow = <p className="EmbedV1__info__ticker__data">Loading<Ellipsis /></p>;
        if (this.props.d.orderbook.data.ready && this.props.d.ticker.ready) {
          if (this.props.d.orderbook.data.asks.length === 0 || this.props.d.orderbook.data.bids.length === 0) {
            dataRow = <p className="EmbedV1__info__ticker__data">No data</p>
          } else {
            let latestPrice = (Number(this.props.d.orderbook.data.asks[0].price) + Number(this.props.d.orderbook.data.bids[0].price)) / 2;
            if (baseNative) {
              dataRow = <p className="EmbedV1__info__ticker__data">{Format.niceRound(latestPrice)} XLM/{this.counterSelling.getCode()}</p>
            } else {
              let latestXLM = Format.niceRound(latestPrice);
              let latestUSD = Format.niceRound(latestXLM * this.props.d.ticker.data._meta.externalPrices.USD_XLM);
              dataRow = <p className="EmbedV1__info__ticker__data">{latestXLM} XLM<span className="EmbedV1__info__ticker__spacer">&nbsp;</span>${latestUSD}</p>
            }
          }
        }

        currentPrice = <div className="EmbedV1__info__ticker">
          <p className="EmbedV1__info__ticker__title">Current price for {this.baseBuying.getCode()}</p>
          {dataRow}
        </div>
      }

      return <div className="EmbedV1">
        <div className="EmbedV1__info">
          <div className="EmbedV1__info__card">
            <AssetCard2 code={this.assetObj.code} issuer={this.assetObj.issuer}></AssetCard2>
          </div>
          {currentPrice}
        </div>
        <PriceChart minimal d={this.props.d}></PriceChart>
      </div>
    } catch (e) {
      console.error(e);
      return <div>Error occured when trying to load <strong>{window.location.hash}</strong></div>
    }
  }
};
