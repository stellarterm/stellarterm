const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import _ from 'lodash';

export default function AccountView({session}) {
  let balances = [];
  session.account.balances.forEach(balance => {
    let balanceAsset = Stellarify.asset(balance);
    balances.push(<li key={balance.asset_issuer + balance.asset_code}>
      {Printify.assetName(balanceAsset)}: {balance.balance}
    </li>)
  })
  let balancesList = <ul>{balances}</ul>

  let offers = [];
  _.forIn(session.account.offers, offer => {
    console.log(offer)
    offers.push(<li key={offer.id}>{offer.id} - {offer.price}</li>);
    // TODO: only show this
  })
  let offersList = <ul>{offers}</ul>
  return <div>
    <p>Logged in as: {session.account.accountId()}</p>
    {balancesList}
    <p>Offers</p>
    {offersList}
  </div>
}
