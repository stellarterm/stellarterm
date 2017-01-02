const React = window.React = require('react');
const _ = require('lodash');

function OfferTable(props) {
  console.log(props.offers)
  return <table>
    <tbody>
      <tr>
        <th>Price</th>
        <th>XLM</th>
        <th>USD</th>
        <th>Sum(XLM)</th>
      </tr>
      {
        _.map(props.offers, offer =>
          <tr key={offer.offerId}>
            <td>{offer.price}</td>
            <td>{offer.a}</td>
            <td>{offer.b}</td>
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
