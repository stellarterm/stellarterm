const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import AssetCard2 from '../AssetCard2.jsx';
import RemoveTrustLink from './RemoveTrustLink.jsx';
import _ from 'lodash';
import directory from '../../directory';


export default class BalancesTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let account = this.props.d.session.account;
    let allBalances = account.getSortedBalances(); // From MagicSpoon.Account
    let balanceRows = allBalances.map(balance => {
      console.log(balance)
      return <tr className="BalancesTable__row" key={balance.code + balance.issuer}>
        <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
          <AssetCard2 code={balance.code} issuer={balance.issuer}></AssetCard2>
        </td>
        <td className="BalancesTable__row__item BalancesTable__row__item--amount">{Printify.lightenZeros(balance.balance)}</td>
      </tr>
    });

    return <div className="island">
      <div className="island__header">
        Balances for {this.props.d.session.account.accountId()}
      </div>
      <table className="BalancesTable">
        <thead>
          <tr className="BalancesTable__head">
            <td className="BalancesTable__head__cell BalancesTable__head__asset">Asset</td>
            <td className="BalancesTable__head__cell BalancesTable__head__amount">Balance</td>
          </tr>
        </thead>
        <tbody>
          {balanceRows}
        </tbody>
      </table>
    </div>
  }
}
