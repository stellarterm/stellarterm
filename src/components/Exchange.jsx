const React = window.React = require('react');
import OfferTables from './OfferTables.jsx';
import PairPicker from './PairPicker.jsx';
import OfferMakers from './OfferMakers.jsx';
import ManageOffers from './ManageOffers.jsx';
import PriceChart from './PriceChart.jsx';
import Generic from './Generic.jsx';
import Stellarify from '../lib/Stellarify';

export default class Exchange extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenOrderbook(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.props.d.unlistenOrderbook(this.listenId);
  }
  render() {
    if (!this.props.d.orderbook.ready) {
      return <Generic title="Loading orderbook">Loading orderbook data from Horizon</Generic>
    }

    let thinOrderbookWarning;
    let orderbook = this.props.d.orderbook;
    let ticker = this.props.d.ticker;

    if (ticker.ready) {
      let baseSlug = Stellarify.assetToSlug(orderbook.baseBuying);
      let counterSlug = Stellarify.assetToSlug(orderbook.baseBuying);

      let aggregateDepth = 0;

      if (baseSlug !== 'XLM-native') {
        for (let i in ticker.data.assets) {
          if (ticker.data.assets[i].slug === baseSlug) {
            aggregateDepth += ticker.data.assets[i].depth10_USD;
          }
        }
      }
      if (counterSlug !== 'XLM-native') {
        for (let i in ticker.data.assets) {
          if (ticker.data.assets[i].slug === counterSlug) {
            aggregateDepth += ticker.data.assets[i].depth10_USD;
          }
        }
      }

      if (aggregateDepth < 100) {
        thinOrderbookWarning = <div className="Exchange__warning">
          <div className="s-alert s-alert--warning">
            <strong>Warning: This asset does not have much market support. You will likely get an unfavorable exchange rate and lose money.</strong>
          </div>
        </div>
      }
    }

    return <div>
      <div className="so-back islandBack islandBack--t">
        <PairPicker d={this.props.d}></PairPicker>
      </div>
      <PriceChart d={this.props.d}></PriceChart>
      <div className="so-back islandBack">
        <div className="island island--pb">
          <div className="island__header">
            Orderbook
          </div>
          {thinOrderbookWarning}
          <OfferMakers d={this.props.d}></OfferMakers>
          <div className="island__separator"></div>
          <OfferTables d={this.props.d}></OfferTables>
        </div>
      </div>
      <div className="so-back islandBack">
        <div className="island">
          <div className="island__header">
            Manage offers
          </div>
          <ManageOffers d={this.props.d}></ManageOffers>
        </div>
      </div>
    </div>
  }
}

