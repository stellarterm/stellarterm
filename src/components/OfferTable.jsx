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
      <div className="OfferTable__header__item">Price</div>
      <div className="OfferTable__header__item">{props.baseCurrency}</div>
      <div className="OfferTable__header__item">{props.counterCurrency}</div>
      <div className="OfferTable__header__item">Depth ({props.counterCurrency})</div>
    </div>
    <table className="OfferTable__table"><tbody>
      {
        _.map(props.offers, (offer, index) => {
          let altColor = index % 2 === 0 ? '#fff' : '#f4f4f5'; // #f4f4f5 is $s-color-neutral8
          let depthPercentage = Math.min(100, Number(offer.depth / props.maxDepth * 100).toFixed(1));
          let rowStyle = {};
          if (props.side === 'buy') {
            rowStyle.background = `linear-gradient(to left, ${buyBackground} ${depthPercentage}%, ${altColor} ${depthPercentage}%)`;
          } else {
            rowStyle.background = `linear-gradient(to right, ${sellBackground} ${depthPercentage}%, ${altColor} ${depthPercentage}%)`;
          }
          return <tr
            className="OfferTable__row"
            key={offer.key}
            style={rowStyle}
            onClick={() => props.d.handlers.orderbookPricePick(offer.price)}>
            <td className="OfferTable__row__item">{Printify.lightenZeros(offer.price, priceNumDecimals)}</td>
            <td className="OfferTable__row__item">{Printify.lightenZeros(offer.base)}</td>
            <td className="OfferTable__row__item">{Printify.lightenZeros(offer.counter)}</td>
            <td className="OfferTable__row__item">{Printify.lightenZeros(offer.depth, depthNumDecimals)}</td>
          </tr>
        })
      }
    </tbody></table>
  </div>
}
OfferTable.propTypes = {
  offers: PropTypes.arrayOf(PropTypes.object).isRequired,
  side: PropTypes.oneOf(['buy', 'sell']).isRequired,
};
