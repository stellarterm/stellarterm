const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import AssetCard from '../AssetCard.jsx';
import _ from 'lodash';

export default class AddTrustRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: 'ready', // ready, error, or pending
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
        this.setState({status: 'error'})
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
      button = <button className="s-button" onClick={(e) => this.handleSubmitTrust(e)}>Error creating trust line for {this.props.asset.getCode()}</button>
    } else {
      if (found) {
        button = <span className="AddTrustRow__exists">Trust line for {this.props.asset.getCode()} exists</span>
      } else {
        button = <button className="s-button" onClick={(e) => this.handleSubmitTrust(e)}>Create trust line for {this.props.asset.getCode()}</button>
      }
    }

    return <div className="row">
      <div className="row__fixedAsset">
        <AssetCard asset={this.props.asset} fixed={true}></AssetCard>
      </div>
      <div className="row__shareOption">
        {button}
      </div>
    </div>
  }
}
