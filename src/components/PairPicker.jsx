const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import AssetPair from './AssetPair.jsx';
const Format = require('../lib/Format');
import Ellipsis from './Ellipsis.jsx';

export default class PairPicker extends React.Component {
  constructor(props) {
    super(props);
    this.unsub = this.props.d.ticker.event.sub(() => {this.forceUpdate()});
  }
  componentWillUnmount() {
    this.unsub();
  }
  render() {
    if (!this.props.d.orderbook.data.ready) {
      return <div>loading</div>
    }

    let baseBuying = this.props.d.orderbook.data.baseBuying;
    let counterSelling = this.props.d.orderbook.data.counterSelling;

    let main;

    let baseNative = baseBuying.isNative();
    let counterNative = counterSelling.isNative();

    if (baseNative || counterNative) {
      let dataRow = <p className="PairPicker__infoBar__ticker__data">Loading<Ellipsis /></p>;
      if (this.props.d.orderbook.data.ready && this.props.d.ticker.ready) {
        if (this.props.d.orderbook.data.asks.length === 0 || this.props.d.orderbook.data.bids.length === 0) {
          dataRow = <p className="PairPicker__infoBar__ticker__data">No data</p>
        } else {
          let latestPrice = (Number(this.props.d.orderbook.data.asks[0].price) + Number(this.props.d.orderbook.data.bids[0].price)) / 2;
          if (baseNative) {
            dataRow = <p className="PairPicker__infoBar__ticker__data">{Format.niceRound(latestPrice)} XLM/{counterSelling.getCode()}</p>
          } else {
            let latestXLM = Format.niceRound(latestPrice);
            if (1 - this.props.d.orderbook.data.bids[0].price/this.props.d.orderbook.data.asks[0].price > 0.4) {
              latestXLM = Format.niceRound(this.props.d.orderbook.data.bids[0].price);
            }
            let latestUSD = Format.niceRound(latestXLM * this.props.d.ticker.data._meta.externalPrices.USD_XLM);
            dataRow = <p className="PairPicker__infoBar__ticker__data">{latestXLM} XLM<span className="PairPicker__infoBar__ticker__spacer">&nbsp;</span>${latestUSD}</p>
          }
        }
      }

      main = <div className="PairPicker__infoBar">
        <div className="PairPicker__infoBar__pair">
          <AssetPair baseBuying={baseBuying} counterSelling={counterSelling}></AssetPair>
        </div>
        <div className="PairPicker__infoBar__ticker">
          <p className="PairPicker__infoBar__ticker__title">Current price for {baseBuying.getCode()}</p>
          {dataRow}
        </div>
      </div>
    } else {
      // Just show basic pair
      main = <div className="PairPicker__pair">
        <AssetPair baseBuying={baseBuying} counterSelling={counterSelling}></AssetPair>
      </div>
    }

    return (
      <div className="island">
        {main}
        <a href="#markets" className="PairPicker__auxInfo">
          <span>See other trading pairs</span>
        </a>
      </div>
    );
  }
};
