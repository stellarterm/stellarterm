const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import _ from 'lodash';

export default function AccountView({d}) {
  let account = d.session.account;
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
    if (balance.asset_type !== 'native') {
      let limit = balance.limit == '922337203685.4775807' ? 'unlimited': balance.limit;
      trustLines.push(<li key={balance.asset_issuer + balance.asset_code}>
        <span>{balance.asset_code}: Issuer: {balance.asset_issuer} Limit: {limit}</span>
        <button onClick={() => d.handlers.removeTrustLine(balance.asset, '0')}>Remove</button>
      </li>)
    }
  })
  let trustLinesList = <ul>{trustLines}</ul>

  let offers = [];
  _.forIn(account.offers, offer => {
    offers.push(<li key={offer.id}>{offer.id} - {1/offer.price}<button onClick={() => d.handlers.removeOffer(offer.id)}>Remove</button></li>);
    // TODO: only show this
  })
  let offersList = <ul>{offers}</ul>
  return <div>
    <p>Logged in as: {account.accountId()}</p>
    {balancesList}
    <p>Offers</p>
    {offersList}
    <p>Trust Lines</p>
    {trustLinesList}
  </div>
}
