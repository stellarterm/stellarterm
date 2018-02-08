const React = window.React = require('react');
const _ = require('lodash');
import Printify from '../lib/Printify';
import Format from '../lib/Format';
import PropTypes from 'prop-types';

const oddBackground = '#f7f7f7';
const buyBackground = '#dcf6de';
const sellBackground = '#fed6d8';

// Dumb component that mainly renders the UI
export default function OfferTable(props) {
  let depthNumDecimals = 7;
  let priceNumDecimals = 7;
  if (props.offers.length > 0) {
    depthNumDecimals = Math.max(3, Format.niceNumDecimals(props.offers[0].depth));
    if (props.side === 'buy') {
      priceNumDecimals = Math.max(4, Format.niceNumDecimals(props.offers[props.offers.length - 1].price))
    } else {
      priceNumDecimals = Math.max(4, Format.niceNumDecimals(props.offers[0].price))
    }
  }
  return <div className="OfferTable">
    <div className="OfferTable__header">
      <div className="OfferTable__header__item OfferTable__cell--price">Price</div>
      <div className="OfferTable__header__item OfferTable__cell--amount">{props.baseCurrency}</div>
      <div className="OfferTable__header__item OfferTable__cell--amount">{props.counterCurrency}</div>
      <div className="OfferTable__header__item OfferTable__cell--depth">Depth {props.counterCurrency}</div>
    </div>
    <div className="OfferTable__table">
      {
        _.map(props.offers, (offer, index) => {
          let altColor = index % 2 === 0 ? '#fff' : '#f9f9f9'; // #f4f4f5 is $s-color-neutral8
          let depthPercentage = Math.min(100, Number(offer.depth / props.maxDepth * 100).toFixed(1));
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
            onClick={() => props.d.orderbook.handlers.pickPrice(offer.price)}>
            <div className="OfferTable__row__item OfferTable__cell--price"><div className="OfferTable__row__background"></div>{Printify.lightenZeros(offer.price, priceNumDecimals)}</div>
            <div className="OfferTable__row__item OfferTable__cell--amount">{Printify.lightenZeros(offer.base)}</div>
            <div className="OfferTable__row__item OfferTable__cell--amount">{Printify.lightenZeros(offer.counter)}</div>
            <div className="OfferTable__row__item OfferTable__cell--depth">{Printify.lightenZeros(offer.depth, depthNumDecimals)}</div>
          </div>
        })
      }
    </div>
  </div>
}
OfferTable.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.object).isRequired,
  side: PropTypes.oneOf(['buy', 'sell']).isRequired,
};
