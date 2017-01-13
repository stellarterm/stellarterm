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
      let limit = balance.limit == '922337203685.4775807' ? 'Maximum': balance.limit;
      trustLines.push(<li key={balance.asset_issuer + balance.asset_code}>
        {balance.asset_code}: Issuer: {balance.asset_issuer} Limit: {limit}
      </li>)
    }
  })
  let trustLinesList = <ul>{trustLines}</ul>

  let offers = [];
  _.forIn(account.offers, offer => {
    console.log(offer)
    offers.push(<li key={offer.id}>{offer.id} - {1/offer.price}</li>);
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
