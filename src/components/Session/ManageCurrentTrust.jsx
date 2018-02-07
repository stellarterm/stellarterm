const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import AssetCard2 from '../AssetCard2.jsx';
import RemoveTrustLink from './RemoveTrustLink.jsx';
import _ from 'lodash';

export default class ManageCurrentTrust extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let account = this.props.d.session.account;
    let allBalances = account.getSortedBalances({hideNative: true}); // From MagicSpoon.Account

    let rows = allBalances.map(balance => {
      let removeLink = <RemoveTrustLink balance={balance} d={this.props.d}></RemoveTrustLink>
      return <tr className="BalancesTable__row" key={balance.code + balance.issuer}>
        <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
          <AssetCard2 code={balance.code} issuer={balance.issuer}></AssetCard2>
        </td>
        <td className="ManageCurrentTrust__row__item">{removeLink}</td>
      </tr>
    });

    if (rows.length === 0) {
      rows.push(<tr className="BalancesTable__row" key={0}>
        <td className="BalancesTable__row__none" colSpan="2">
          You currently don't accept any assets.
        </td>
      </tr>)
    }

    return <div className="island">
      <div className="island__header">
        Assets you accept
      </div>
      <div className="island__paddedContent">
        To receive assets on the Stellar network, you must first "accept" the asset.
      </div>
      <div className="island__separator"></div>
      <table className="ManageCurrentTrust">
        <thead>
          <tr className="ManageCurrentTrust__head">
            <td className="ManageCurrentTrust__head__asset">Asset</td>
            <td className="ManageCurrentTrust__head__cell">Manage</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  }
}
