const React = window.React = require('react');
const OfferTable = require('./OfferTable.jsx')

class OffersTable extends React.Component {
  render() {
    let offers = [
      {
        offerId: "0xbamb00",
        price: 0.01,
        a: 100,
        b: 1,
        depth: 100,
      },
      {
        offerId: "0xc0ffee",
        price: 0.02,
        a: 100,
        b: 2,
        depth: 100,
      },
      {
        offerId: "0xNotActuallyHex",
        price: 0.03,
        a: 33,
        b: 1,
        depth: 33,
      },
    ]
    return (
      <div>
        <div>
          Buy offers
          {OfferTable({offers})}
        </div>
      </div>
    );
  }
};

export default OffersTable;

