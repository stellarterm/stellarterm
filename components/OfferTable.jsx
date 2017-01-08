const React = window.React = require('react');
const _ = require('lodash');

// Dumb component that mainly renders the UI

function OfferTable(props) {
  return <table>
    <tbody>
      <tr>
        <th>Price</th>
        <th>{props.baseCurrency}</th>
        <th>{props.counterCurrency}</th>
        <th>Depth ({props.counterCurrency})</th>
      </tr>
      {
        _.map(props.offers, offer =>
          <tr key={offer.key}>
            <td>{offer.price}</td>
            <td>{offer.base}</td>
            <td>{offer.counter}</td>
            <td>{offer.depth}</td>
          </tr>
        )
      }
    </tbody>
  </table>
}
OfferTable.propTypes = {
  offers: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};
export default OfferTable
