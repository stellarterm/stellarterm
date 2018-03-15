const React = window.React = require('react');
import OfferTables from './OfferTables.jsx';
import PairPicker from './PairPicker.jsx';
import OfferMakers from './OfferMakers.jsx';
import ManageOffers from './ManageOffers.jsx';
import PriceChart from './PriceChart.jsx';
import Generic from './Generic.jsx';
import Stellarify from '../lib/Stellarify';
import TermsOfUse from './TermsOfUse.jsx';
import Ellipsis from './Ellipsis.jsx';

export default class Exchange extends React.Component {
  constructor(props) {
    super(props);
    this.unsub = this.props.d.orderbook.event.sub(() => {this.forceUpdate()});
    this.unsubSession = this.props.d.session.event.sub(() => {this.forceUpdate()});
  }
  componentWillUnmount() {
    this.unsub();
    this.unsubSession();
  }
  render() {
    if (this.props.d.session.state === 'in' && !this.props.d.session.termsDone) {
      return <TermsOfUse accept={this.props.d.session.handlers.acceptTerms}></TermsOfUse>
    }

    if (!this.props.d.orderbook.data.ready) {
      return <Generic title="Loading orderbook">Loading orderbook data from Horizon<Ellipsis /></Generic>
    }

    let thinOrderbookWarning;
    let data = this.props.d.orderbook.data;
    let ticker = this.props.d.ticker;

    if (ticker.ready) {
      let baseSlug = Stellarify.assetToSlug(data.baseBuying);
      let counterSlug = Stellarify.assetToSlug(data.counterSelling);

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
            The orderbook for this pair is thin. To get a better price, create an offer without taking an existing one.
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
        <div className="island Exchange__orderbook">
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

