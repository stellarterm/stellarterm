const React = window.React = require('react');
import Stellarify from '../lib/Stellarify';
import Printify from '../lib/Printify';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
BigNumber.config({ EXPONENTIAL_AT: 100 });

export default class OfferMaker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valid: false,
      price: '523', // Most sticky item (since the price is pretty static)
      amount: '10',

      // Total = price * amount
      total: '5230',
    };

    let normalizeInput = (input) => {
      // return input.replace()
    }
    // TODO: Limit the number of digits after the decimal that can be input
    this.updateState = (item, e) => {
      let state = Object.assign(this.state);
      state.valid = false;
      let value = e.target.value;
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
          state.price = new BigNumber(new BigNumber(value).times(new BigNumber(state.amount)).toFixed(7)).toString();
        } else {
          throw new Error('Invalid item type');
        }

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
    }
  }
  render() {
    if (!this.props.d.orderbook.ready) {
      return <div>Loading</div>;
    }


    return <div>
      <form onSubmit={this.handleSubmit}>
        <div>Price: <input type="text" value={this.state.price} onChange={(e) => this.updateState('price', e)} placeholder="Price" /></div>
        <div>Amount: <input type="text" value={this.state.amount} onChange={(e) => this.updateState('amount', e)} placeholder="Price" /></div>
        <div>Total: <input type="text" value={this.state.total} onChange={(e) => this.updateState('total', e)} placeholder="Price" /></div>
        <input type="submit" value="Submit offer"></input>
      </form>
    </div>
  }
};

OfferMaker.propTypes = {
  side: React.PropTypes.oneOf(['buy', 'sell']).isRequired,
}
