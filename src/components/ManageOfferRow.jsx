const React = window.React = require('react');
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';

export default class ManageOffers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: true,
    };
    this.handleCancel = e => {
      e.preventDefault();
      this.props.d.handlers.removeOffer(this.props.rectifiedOffer.id)
      this.setState({
        ready: false,
      })
    }
  }
  render() {
    let cancelLink;
    if (this.state.ready) {
      cancelLink = <a onClick={this.handleCancel}>Cancel offer</a>;
    } else {
      cancelLink = <span>Cancelling...</span>;
    }
    let orderbook = this.props.d.orderbook;
    return <tr className="ManageOffers__table__row">
      <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.price}</td>
      <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.baseAmount}</td>
      <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.counterAmount}</td>
      <td className="ManageOffers__table__row__item">{cancelLink}</td>
    </tr>
  }
};

