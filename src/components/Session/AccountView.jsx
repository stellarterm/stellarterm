const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';

export default function AccountView({session}) {
  console.log(session)
  let balances = [];
  session.account.balances.forEach(balance => {
    console.log(balance)
    let balanceAsset = Stellarify.asset(balance);
    balances.push(<li key={balance.asset_issuer + balance.asset_code}>
      {Printify.assetName(balanceAsset)}: {balance.balance}
    </li>)
  })
  let balancesList = <ul>{balances}</ul>
  return <div>
    <p>Logged in as: {session.account.accountId}</p>
    {balancesList}
  </div>
}
