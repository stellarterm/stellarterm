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
      this.props.d.session.handlers.removeOffer(this.props.rectifiedOffer.id)
      .then(bssResult => {
        if (bssResult.status === 'finish') {
          this.setState({ready: false})
          return bssResult.serverResult
          .catch(err => {
            console.log('Errored when cancelling offer', err);
            this.setState({
              ready: 'true',
            })
          })
        }
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
    if (this.props.invert) {
      return <tr className="ManageOffers__table__row">
        <td className="ManageOffers__table__row__item">{cancelLink}</td>
        <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.counterAmount}</td>
        <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.baseAmount}</td>
        <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.price}</td>
      </tr>
    } else {
      return <tr className="ManageOffers__table__row">
        <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.price}</td>
        <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.baseAmount}</td>
        <td className="ManageOffers__table__row__item">{this.props.rectifiedOffer.counterAmount}</td>
        <td className="ManageOffers__table__row__item">{cancelLink}</td>
      </tr>
    }
  }
};

