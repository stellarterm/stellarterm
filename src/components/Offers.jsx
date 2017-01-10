const React = window.React = require('react');
import OfferTable from './OfferTable.jsx';
import Stellarify from '../lib/Stellarify';
import Printify from '../lib/Printify';
import _ from 'lodash';

class Offers extends React.Component {
  constructor(props) {
    super(props);
    props.d.listenOrderbook(() => {
      this.forceUpdate();
    });
  }
  render() {
    console.log(this.props.d.orderbook)
    if (!this.props.d.orderbook.ready) {
      return <div>Loading</div>;
    }

    let orderbook = this.props.d.orderbook;

    let baseLabel = Printify.assetName(orderbook.baseBuying);
    let counterLabel = Printify.assetName(orderbook.counterSelling);

    let buyDepth = 0;
    let buys = _.map(orderbook.bids, (bid) => {
      buyDepth += Number(bid.amount);
      return {
        key: bid.price,
        price: bid.price,
        base: (Number(bid.amount) * Number(bid.price)).toFixed(7),
        counter: bid.amount,
        depth: buyDepth.toFixed(7),
      }
    });

    let sellDepth = 0;
    let sells = _.map(orderbook.asks, (ask) => {
      sellDepth += Number(ask.amount) * Number(ask.price);
      return {
        key: ask.price,
        price: ask.price,
        base: ask.amount,
        counter: (Number(ask.amount) * Number(ask.price)).toFixed(7),
        depth: sellDepth.toFixed(7),
      }
    });

    return (
      <div>
        <div>
          Buy offers
          {OfferTable({
            offers: buys,
            counterCurrency: counterLabel,
            baseCurrency: baseLabel,
          })}

          Sell offers
          {OfferTable({
            offers: sells,
            counterCurrency: counterLabel,
            baseCurrency: baseLabel,
          })}
        </div>
      </div>
    );
  }
};

export default Offers;
