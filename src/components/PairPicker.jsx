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

    if (counterSelling.isNative()) {
      let dataRow = <p className="PairPicker__infoBar__ticker__data">Loading<Ellipsis /></p>;
      if (this.props.d.orderbook.data.trades && this.props.d.ticker.ready) {
        let trades = this.props.d.orderbook.data.trades;
        let latestTrade = trades[trades.length - 1];

        let latestXLM = Format.niceRound(latestTrade[1]);
        let latestUSD = Format.niceRound(latestXLM * this.props.d.ticker.data._meta.externalPrices.USD_XLM);

        dataRow = <p className="PairPicker__infoBar__ticker__data">{latestXLM} XLM<span className="PairPicker__infoBar__ticker__spacer"> </span>${latestUSD}</p>
      }

      main = <div className="PairPicker__infoBar">
        <div className="PairPicker__infoBar__pair">
          <AssetPair baseBuying={baseBuying} counterSelling={counterSelling}></AssetPair>
        </div>
        <div className="PairPicker__infoBar__ticker">
          <p className="PairPicker__infoBar__ticker__title">Last price for {baseBuying.getCode()}</p>
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
        <div className="PairPicker__auxInfo">
          To see other orderbooks, go to the <a href="#markets">market list page</a>.
        </div>
      </div>
    );
  }
};
