const React = window.React = require('react');
const _ = require('lodash');
import Printify from '../lib/Printify';



const oddBackground = '#f7f7f7';
const buyBackground = '#dcf6de';
const sellBackground = '#fed6d8';

// Dumb component that mainly renders the UI
export default function OfferTable(props) {
  return <div className="OfferTable">
    <div className="OfferTable__header">
      <div className="OfferTable__header__item">Price</div>
      <div className="OfferTable__header__item">{props.baseCurrency}</div>
      <div className="OfferTable__header__item">{props.counterCurrency}</div>
      <div className="OfferTable__header__item">Depth ({props.counterCurrency})</div>
    </div>
    {
      _.map(props.offers, (offer, index) => {
        let altColor = index % 2 === 0 ? '#fff' : '#f4f4f5'; // #f4f4f5 is $s-color-neutral8
        let depthPercentage = Number(offer.depth / props.maxDepth * 100).toFixed(1);
        let rowStyle = {};
        if (props.side === 'buy') {
          rowStyle.background = `linear-gradient(to left, ${buyBackground} ${depthPercentage}%, ${altColor} ${depthPercentage}%)`;
        } else {
          rowStyle.background = `linear-gradient(to right, ${sellBackground} ${depthPercentage}%, ${altColor} ${depthPercentage}%)`;
        }
        return <div
          className="OfferTable__row"
          key={offer.key}
          style={rowStyle}
          onClick={() => props.d.handlers.orderbookPricePick(offer.price)}>
          <div className="OfferTable__row__item">{Printify.lightenZeros(offer.price)}</div>
          <div className="OfferTable__row__item">{Printify.lightenZeros(offer.base)}</div>
          <div className="OfferTable__row__item">{Printify.lightenZeros(offer.counter)}</div>
          <div className="OfferTable__row__item">{Printify.lightenZeros(offer.depth)}</div>
        </div>
      })
    }
  </div>
}
OfferTable.propTypes = {
  offers: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  side: React.PropTypes.oneOf(['buy', 'sell']).isRequired,
};
