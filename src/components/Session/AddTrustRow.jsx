const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import AssetCard2 from '../AssetCard2.jsx';
import _ from 'lodash';

export default class AddTrustRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: 'ready', // ready, error, or pending
      errorType: '', // 'unknown' | 'lowReserve'
    }

    this.handleSubmitTrust = (event) => {
      event.preventDefault();
      this.setState({status: 'pending'})
      this.props.d.handlers.addTrust(this.props.asset.getCode(), this.props.asset.getIssuer())
      .then((result) => {
        this.forceUpdate();
        this.setState({status: 'ready'})
      })
      .catch(error => {
        let errorType = 'unknown';
        if (error.extras && error.extras.result_codes.operations[0] === 'op_low_reserve') {
          errorType = 'lowReserve';
        }

        this.setState({
          status: 'error',
          errorType,
        })
      })
    }
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
      button = <button className="s-button" disabled={true} onClick={(e) => this.handleSubmitTrust(e)}>Creating trust line for {this.props.asset.getCode()}...</button>
    } else if (this.state.status === 'error') {
      if (this.state.errorType === 'lowReserve') {
        button = <button className="s-button" onClick={(e) => this.handleSubmitTrust(e)}>Error: Not enough lumens</button>
      } else {
        button = <button className="s-button" onClick={(e) => this.handleSubmitTrust(e)}>Error creating trust line for {this.props.asset.getCode()}</button>
      }
    } else {
      if (found) {
        button = <span className="AddTrustRow__exists">{this.props.asset.getCode()} accepted</span>
      } else {
        button = <button className="s-button" onClick={(e) => this.handleSubmitTrust(e)}>Accept {this.props.asset.getCode()}</button>
      }
    }

    return <div className="AddTrustRow row">
      <div className="row__assetCard2">
        <AssetCard2 code={this.props.asset.getCode()} issuer={this.props.asset.getIssuer()}></AssetCard2>
      </div>
      <div className="row__shareOption">
        {button}
      </div>
    </div>
  }
}
