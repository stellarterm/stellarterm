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

    let nativeBalances = [];
    let knownBalances = [];
    let unknownBalances = [];
    account.balances.forEach(balance => {
      if (balance.asset_type === 'native') {
        return nativeBalances.push(balance);
      }
      return unknownBalances.push(balance);
    });

    const reorderedBalances = nativeBalances.concat(knownBalances, unknownBalances);

    let balanceCards = [];
    reorderedBalances.forEach(balance => {
      let balanceAsset = Stellarify.asset(balance);
      let limit = balance.limit == '922337203685.4775807' ? 'maximum': balance.limit;

      let removeLink = <RemoveTrustLink balance={balance} d={this.props.d}></RemoveTrustLink>

      let limitCell = <td className="ManageCurrentTrust__row__item">N/A</td>;
      if (balance.asset_type !== 'native') {
        limitCell = <td className="ManageCurrentTrust__row__item">Trust limit: {limit}<br />{removeLink}</td>
      }

      let code = balance.asset_code;
      let issuer = balance.asset_issuer;
      if (balance.asset_type === 'native') {
        code = 'XLM';
        issuer = null;
      }

      balanceCards.push(<tr className="ManageCurrentTrust__row" key={balance.asset_issuer + balance.asset_code}>
        <td className="ManageCurrentTrust__row__item ManageCurrentTrust__row__item--assetCard">
          <AssetCard2 code={code} issuer={issuer}></AssetCard2>
        </td>
        <td className="ManageCurrentTrust__row__item ManageCurrentTrust__row__item--amount">{Printify.lightenZeros(balance.balance)}</td>
        {limitCell}
      </tr>);
    })

    return <div className="island">
      <div className="island__header">
        Balances for {this.props.d.session.account.accountId()}
      </div>
      <table className="ManageCurrentTrust">
        <thead>
          <tr className="ManageCurrentTrust__head">
            <td className="ManageCurrentTrust__head__asset">Asset</td>
            <td className="ManageCurrentTrust__head__amount">Balance</td>
            <td className="ManageCurrentTrust__head__cell">Trust</td>
          </tr>
        </thead>
        <tbody>
          {balanceCards}

        </tbody>
      </table>
    </div>
  }
}
