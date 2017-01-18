const React = window.React = require('react');
import OfferTables from './OfferTables.jsx';
import PairPicker from './PairPicker.jsx';
import OfferMakers from './OfferMakers.jsx';
import ManageOffers from './ManageOffers.jsx';
import PriceChart from './PriceChart.jsx';
import Generic from './Generic.jsx';

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

