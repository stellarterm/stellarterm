const React = window.React = require('react');
const OfferTable = require('./OfferTable.jsx');
const Stellarify = require('../lib/Stellarify');

class Offers extends React.Component {
  render() {
    let orderbookDetails = Stellarify.orderbookDetails(this.props.orderbookDetails);

    // We use a space so that users can't be phished as easily
    let baseLabel = orderbookDetails.base.isNative() ? 'native lumens' : orderbookDetails.base.getCode();
    let counterLabel = orderbookDetails.counter.isNative() ? 'native lumens' : orderbookDetails.counter.getCode();

    let buyDepth = 0;
    let buys = _.map(orderbookDetails.bids, (bid) => {
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
    let sells = _.map(orderbookDetails.asks, (ask) => {
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
