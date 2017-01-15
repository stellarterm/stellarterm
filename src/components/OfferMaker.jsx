const React = window.React = require('react');
import Stellarify from '../lib/Stellarify';
import Printify from '../lib/Printify';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

// OfferMaker is an uncontrolled element (from the perspective of its users)
export default class OfferMaker extends React.Component {
  initialize() {
    if (!this.initialized) {
      this.initialized = true;
      let state = {};

      // Initialize price
      if (this.props.side === 'buy' && this.props.d.orderbook.bids.length > 0) {
        state.price = new BigNumber(this.props.d.orderbook.bids[0].price).toString() // Get rid of extra 0s
      } else if (this.props.d.orderbook.asks.length > 0) { // Proptypes validation makes sure this is sell
        state.price = new BigNumber(this.props.d.orderbook.asks[0].price).toString() // Get rid of extra 0s
      }

      return state;
    }
    return {};
  }
  constructor(props) {
    super(props);
    this.initialized = false;

    this.props.d.listenSession(() => {
      this.forceUpdate();
    });

    props.d.listenOrderbook(() => {
      this.setState(this.initialize());
      this.forceUpdate();
    });

    this.props.d.listenOrderbookPricePick(opts => {
      this.updateState('price', opts.price);
    });

    this.state = {
      valid: false,
      price: '', // Most sticky item (since the price is pretty static)
      amount: '',

      // Total = price * amount
      total: '',
    };

    if (this.props.d.orderbook.ready) {
      this.state = Object.assign(this.state, this.initialize());
    }

    // TODO: Limit the number of digits after the decimal that can be input
    this.updateState = (item, value) => {
      let state = Object.assign(this.state);
      state.valid = false;
      if (item == 'price') {
        state.price = value;
      } else if (item == 'amount') {
        state.amount = value;
      } else if (item == 'total') {
        state.total = value;
      } else {
        throw new Error('Invalid item type');
      }

      try {
        // If there is an error, we will just let the user input change but not the affected inputs
        if (item == 'price') {
          state.total = new BigNumber(new BigNumber(value).times(new BigNumber(state.amount)).toFixed(7)).toString();
        } else if (item == 'amount') {
          state.total = new BigNumber(new BigNumber(value).times(new BigNumber(state.price)).toFixed(7)).toString();
        } else if (item == 'total') {
          state.amount = new BigNumber(new BigNumber(value).dividedBy(new BigNumber(state.price)).toFixed(7)).toString();
        } else {
          throw new Error('Invalid item type');
        }

        // TODO: truer valid
        state.valid = true;
      } catch(e) {
        // Invalid input somewhere
      }
      this.setState(state);
    }

    props.d.listenOrderbook(() => {
      this.forceUpdate();
    });

    this.handleSubmit = (e) => {
      // TODO: Hook up with driver
      e.preventDefault();
      props.d.handlers.createOffer(props.side, {
        price: this.state.price,
        amount: this.state.amount,
        total: this.state.total,
      })
    }
  }
  render() {
    if (!this.props.d.orderbook.ready) {
      return <div>Loading</div>;
    }

    let capitalizedSide = 'Buy';
    if (this.props.side === 'sell') {
      capitalizedSide = 'Sell';
    }

    let baseAssetName = Printify.assetName(this.props.d.orderbook.baseBuying);
    let counterAssetName = Printify.assetName(this.props.d.orderbook.counterSelling);

    let title;
    if (this.props.side === 'buy') {
      title = `Buy ${baseAssetName}`;
    } else {
      title = `Sell ${baseAssetName}`;
    }

    let submit;
    if (this.props.d.session.state === 'in') {
      submit = <input type="submit" className="s-button" value={capitalizedSide + ' ' + baseAssetName} disabled={!this.state.valid}></input>
    } else {
      submit = <span><a href="#account">Log in</a> to create an offer</span>
    }

    let summary;
    if (this.state.valid) {
      if (this.props.side === 'buy') {
        summary = <div className="s-alert s-alert--info">Buy {this.state.amount} {baseAssetName} for {this.state.total} {counterAssetName}</div>;
      } else {
        summary = <div className="s-alert s-alert--info">Sell {this.state.amount} {baseAssetName} for {this.state.total} {counterAssetName}</div>;
      }
    }



    return <div>
      <h3 className="island__sub__division__title island__sub__division__title--left">{title}</h3>
      <form onSubmit={this.handleSubmit}  disabled={!this.state.valid}>
        <table className="OfferMaker__table">
          <tbody>
            <tr className="OfferMaker__table__row">
              <td className="OfferMaker__table__label">Price per {baseAssetName}</td>
              <td className="OfferMaker__table__input">
                <input type="text" className="OfferMaker__table__input__input" value={this.state.price} onChange={(e) => this.updateState('price', e.target.value)} placeholder="" />
              </td>
            </tr>
            <tr className="OfferMaker__table__row">
              <td className="OfferMaker__table__label">Amount {baseAssetName}</td>
              <td className="OfferMaker__table__input">
                <input type="text" className="OfferMaker__table__input__input" value={this.state.amount} onChange={(e) => this.updateState('amount', e.target.value)} placeholder="" />
              </td>
            </tr>
            <tr className="OfferMaker__table__row">
              <td className="OfferMaker__table__label">Total {counterAssetName}</td>
              <td className="OfferMaker__table__input">
                <input type="text" className="OfferMaker__table__input__input" value={this.state.total} onChange={(e) => this.updateState('total', e.target.value)} placeholder="" />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="OfferMaker__overview">
          {summary}
          {submit}
        </div>
      </form>
    </div>
  }
};

OfferMaker.propTypes = {
  side: React.PropTypes.oneOf(['buy', 'sell']).isRequired,
}
