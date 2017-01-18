const React = window.React = require('react');
import OfferTable from './OfferTable.jsx';
import Stellarify from '../lib/Stellarify';
import Printify from '../lib/Printify';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

export default class OfferTables extends React.Component {
  constructor(props) {
    super(props);
    this.listenOrderbookId = props.d.listenOrderbook(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.props.d.unlistenSession(this.listenOrderbookId);
  }
  render() {
    if (!this.props.d.orderbook.ready) {
      return <div>Loading</div>;
    }

    let orderbook = this.props.d.orderbook;

    let baseLabel = orderbook.baseBuying.getCode();
    let counterLabel = orderbook.counterSelling.getCode();

    let buyDepth = 0;
    let buys = _.map(orderbook.bids, (bid) => {
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
    let sells = _.map(orderbook.asks, (ask) => {
      sellDepth += Number(ask.amount) * Number(ask.price);
      return {
        key: `${ask.price}-${ask.amount}`,
        price: ask.price,
        base: ask.amount,
        counter: (Number(ask.amount) * Number(ask.price)).toFixed(7),
        depth: sellDepth.toFixed(7),
      }
    });

    let maxDepth = BigNumber.max(buyDepth.toFixed(7), sellDepth.toFixed(7));

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

