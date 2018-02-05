const React = window.React = require('react');
import OfferTable from './OfferTable.jsx';
import Stellarify from '../lib/Stellarify';
import Printify from '../lib/Printify';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

export default class OfferTables extends React.Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
  }
  render() {
    if (!this.props.d.orderbook.data.ready) {
      return <div>Loading</div>;
    }

    let data = this.props.d.orderbook.data;

    let baseLabel = data.baseBuying.getCode();
    let counterLabel = data.counterSelling.getCode();

    let buyDepth = 0;
    let cappedBuyDepth = 0;
    let buyBestPrice;
    let buys = _.map(data.bids, (bid) => {
      // Only add to the depth if the offer is within 20% of the best offer (closest to the spread)
      if (!buyBestPrice) {
        buyBestPrice = Number(bid.price);
      }
      if (buyBestPrice/Number(bid.price) < 1.2) {
        cappedBuyDepth += Number(bid.amount);
      }
      buyDepth += Number(bid.amount);
      return {
        key: `${bid.price}-${bid.amount}`,
        price: bid.price,
        base: (Number(bid.amount) / Number(bid.price)).toFixed(7),
        counter: bid.amount,
        depth: buyDepth.toFixed(7),
      }
    });

    let sellDepth = 0;
    let cappedSellDepth = 0;
    let sellBestPrice;
    let sells = _.map(data.asks, (ask) => {
      if (!sellBestPrice) {
        sellBestPrice = Number(ask.price);
      }
      if (Number(ask.price)/sellBestPrice < 1.2) {
        cappedSellDepth += Number(ask.amount) * Number(ask.price);
      }
      sellDepth += Number(ask.amount) * Number(ask.price);
      return {
        key: `${ask.price}-${ask.amount}`,
        price: ask.price,
        base: ask.amount,
        counter: (Number(ask.amount) * Number(ask.price)).toFixed(7),
        depth: sellDepth.toFixed(7),
      }
    });

    let maxDepth = BigNumber.max(cappedBuyDepth.toFixed(7), cappedSellDepth.toFixed(7));

    return (
      <div className="OfferTables island__sub">
        <div className="island__sub__division">
          <h3 className="island__sub__division__title">Buy offers</h3>
          {OfferTable({
            side: 'buy',
            offers: buys,
            counterCurrency: counterLabel,
            baseCurrency: baseLabel,
            maxDepth,
            d: this.props.d,
          })}
        </div>
        <div className="island__sub__division">
          <h3 className="island__sub__division__title">Sell offers</h3>
          {OfferTable({
            side: 'sell',
            offers: sells,
            counterCurrency: counterLabel,
            baseCurrency: baseLabel,
            maxDepth,
            d: this.props.d,
          })}
        </div>
      </div>
    );
  }
};

