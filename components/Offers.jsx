const React = window.React = require('react');
const OfferTable = require('./OfferTable.jsx');
const Stellarify = require('../lib/Stellarify');

class Offers extends React.Component {
  render() {
    let orderbookDetails = Stellarify.orderbookDetails(this.props.orderbookDetails);

    let buyDepth = 0;
    let buys = _.map(orderbookDetails.bids, (bid) => {
      buyDepth += Number(bid.amount);
      return {
        key: bid.price,
        price: bid.price,
        counter: (Number(bid.amount) * Number(bid.price)).toFixed(7),
        base: bid.amount,
        depth: buyDepth.toFixed(7),
      }
    });

    let sellDepth = 0;
    let sells = _.map(orderbookDetails.asks, (ask) => {
      sellDepth += Number(ask.amount) * Number(ask.price);
      return {
        key: ask.price,
        price: ask.price,
        counter: ask.amount,
        base: (Number(ask.amount) * Number(ask.price)).toFixed(7),
        depth: sellDepth.toFixed(7),
      }
    });

    return (
      <div>
        <div>
          Buy offers
          {OfferTable({
            offers: buys,
            counterCurrency: orderbookDetails.counter.getCode(),
            baseCurrency: orderbookDetails.base.getCode(),
          })}

          Sell offers
          {OfferTable({
            offers: sells,
            counterCurrency: orderbookDetails.counter.getCode(),
            baseCurrency: orderbookDetails.base.getCode(),
          })}
        </div>
      </div>
    );
  }
};

export default Offers;
