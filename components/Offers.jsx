const React = window.React = require('react');
const OfferTable = require('./OfferTable.jsx')

class Offers extends React.Component {
  render() {

    let buyDepth = 0;
    let buys = _.map(this.props.bids, (bid) => {
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
    let sells = _.map(this.props.asks, (ask) => {
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
            counterCurrency: this.props.buying.getCode(),
            baseCurrency: this.props.selling.getCode(),
          })}

          Sell offers
          {OfferTable({
            offers: sells,
            counterCurrency: this.props.buying.getCode(),
            baseCurrency: this.props.selling.getCode(),
          })}
        </div>
      </div>
    );
  }
};

export default Offers;
