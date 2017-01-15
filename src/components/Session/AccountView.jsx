const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import BalancesTable from './BalancesTable.jsx';
import _ from 'lodash';

export default class AccountView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trustCode: 'USD',
      trustIssuer: 'GBZ3P4Z53Z7ZHATW6KCA2OXEBWKQGN2433WMSMKF7OJXWFJL4JT6NG4V',
    }

    this.handleInputTrustCode = (event) => {
      this.setState({trustCode: event.target.value});
    }
    this.handleInputTrustIssuer = (event) => {
      this.setState({trustIssuer: event.target.value});
    }
    this.handleSubmitTrust = (event) => {
      event.preventDefault();
      this.props.d.handlers.addTrust(this.state.trustCode, this.state.trustIssuer);
    }
  }

  render() {
    let account = this.props.d.session.account;
    let balances = [];
    account.balances.forEach(balance => {
      let balanceAsset = Stellarify.asset(balance);
      balances.push(<li key={balance.asset_issuer + balance.asset_code}>
        {Printify.assetName(balanceAsset)}: {balance.balance}
      </li>)
    })
    let balancesList = <ul>{balances}</ul>

    let trustLines = [];
    account.balances.forEach(balance => {
      let removeButton;
      if (balance.balance === '0.0000000') {
        removeButton = <button onClick={() => this.props.d.handlers.removeTrust(balance.asset_code, balance.asset_issuer)}>Remove</button>
      } else {
        removeButton = <button disabled="true">Unable to remove trust line until balance is 0</button>
      }
      if (balance.asset_type !== 'native') {
        let limit = balance.limit == '922337203685.4775807' ? 'unlimited': balance.limit;
        trustLines.push(<li key={balance.asset_issuer + balance.asset_code}>
          <span>{balance.asset_code}: Issuer: {balance.asset_issuer} Limit: {limit}</span>
          {removeButton}
        </li>)
      }
    })
    let trustLinesList = <ul>{trustLines}</ul>

    let offers = [];
    _.forIn(account.offers, offer => {
      offers.push(<li key={offer.id}>{offer.id} - {1/offer.price}<button onClick={() => this.props.d.handlers.removeOffer(offer.id)}>Remove</button></li>);
      // TODO: only show this
    })
    let offersList = <ul>{offers}</ul>
    return <div>
      <p>Logged in as: {account.accountId()}</p>
      <BalancesTable d={this.props.d}></BalancesTable>
      <p>Offers</p>
      {offersList}
      <p>Trust Lines</p>
      {trustLinesList}
      <form onSubmit={this.handleSubmitTrust}>
        <input type="text" value={this.state.trustCode} onChange={this.handleInputTrustCode} placeholder="Asset code" />
        <input type="text" value={this.state.trustIssuer} onChange={this.handleInputTrustIssuer} placeholder="Asset Issuer" />
        <input type="submit" value="Create trust line"></input>
      </form>
    </div>
  }
}
