const React = window.React = require('react');
import _ from 'lodash';

export default class TrustButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'ready', // ready, error, or pending
      errorType: '', // 'unknown' | 'lowReserve'
    }

    this.handleSubmitTrust = (event) => {
      event.preventDefault();
      this.setState({status: 'pending'});
      this.props.d.handlers.addTrust(this.props.asset.getCode(), this.props.asset.getIssuer())
      .then((result) => {
        this.forceUpdate();
        this.setState({status: 'ready'});
      })
      .catch(error => {
        let errorType = 'unknown';
        if (error.extras && error.extras.result_codes.operations[0] === 'op_low_reserve') {
          errorType = 'lowReserve';
        }

        this.setState({
          status: 'error',
          errorType: errorType,
        });
      });
    };
  }

  render() {
    let found = false;
    _.each(this.props.d.session.account.balances, balance => {
      if (balance.asset_code === this.props.asset.getCode() && balance.asset_issuer === this.props.asset.getIssuer()) {
        found = true;
      }
    });

    let button;
    if (this.state.status === 'pending') {
      button = <button className="s-button" disabled={true} onClick={this.handleSubmitTrust}>Creating trust line for {this.props.asset.getCode()}...</button>
    } else if (this.state.status === 'error') {
      if (this.state.errorType === 'lowReserve') {
        button = <button className="s-button" onClick={this.handleSubmitTrust}>Error: Not enough lumens</button>
      } else {
        button = <button className="s-button" onClick={this.handleSubmitTrust}>Error creating trust line for {this.props.asset.getCode()}</button>
      }
    } else {
      if (found) {
        if (this.props.message.startsWith("http://") || this.props.message.startsWith("https://")) {
          button = <button onClick={() => window.open(this.props.message, '_blank')}>{this.props.message}</button>
        } else {
          button = <span className="AddTrustRow__exists">{this.props.message}</span>
        }
      } else {
        button = <button className="s-button" onClick={this.handleSubmitTrust}>{this.props.trustMessage}</button>
      }
    }

    return (<div className="row__shareOption">{button}</div>);
  }
}
