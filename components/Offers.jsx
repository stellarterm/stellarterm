const React = window.React = require('react');
const OfferTable = require('./OfferTable.jsx');
const Stellarify = require('../lib/Stellarify');
const Printify = require('../lib/Printify');

class Offers extends React.Component {
  render() {
    if (this.props.orderbookDetails === undefined) {
      return <div>Loading</div>;
    }

    let orderbookDetails = Stellarify.orderbookDetails(this.props.orderbookDetails);

    let baseLabel = Printify.assetName(orderbookDetails.base);
    let counterLabel = Printify.assetName(orderbookDetails.counter);

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
