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
      let balanceUSD;
      let tradeLink;
      if (this.props.d.ticker.ready) {
        let tickerAsset = _.find(this.props.d.ticker.data.assets, {
          code: balance.code,
          issuer: balance.issuer,
        });
        if (tickerAsset) {
          balanceUSD = '$' + (balance.balance * tickerAsset.price_USD).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
          if (tickerAsset.slug !== 'XLM-native') {
            tradeLink = <a href={'#exchange/' + tickerAsset.topTradePairSlug} className="BalancesTable__row__trade">trade</a>
          }
        } else {
          tradeLink = <a href={'#exchange/' + balance.code + '-' + balance.issuer + '/XLM-native'} className="BalancesTable__row__trade">trade</a>
        }
      }
      let warning;
      let directoryAsset = directory.getAssetByAccountId(balance.code, balance.issuer);
      if (directoryAsset !== null && directoryAsset.warning !== undefined) {
        warning = <div className="s-alert s-alert--warning BalancesTable__row__item__warning">
          {directoryAsset.warning}
        </div>;
      }
      return <tr className="BalancesTable__row" key={balance.code + balance.issuer}>
        <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
          <AssetCard2 code={balance.code} issuer={balance.issuer}></AssetCard2>
          {warning}
        </td>
        <td className="BalancesTable__row__item BalancesTable__row__item--amount">{Printify.lightenZeros(balance.balance)}</td>
        <td className="BalancesTable__row__item BalancesTable__row__item--amount">{balanceUSD}</td>
        <td className="BalancesTable__row__item BalancesTable__row__item--amount">{tradeLink}</td>
      </tr>
    });

    return <table className="BalancesTable">
      <thead>
        <tr className="BalancesTable__head">
          <td className="BalancesTable__head__cell BalancesTable__row__item--heading BalancesTable__head__asset">Asset</td>
          <td className="BalancesTable__head__cell BalancesTable__row__item--heading BalancesTable__head__amount">Balance</td>
          <td className="BalancesTable__head__cell BalancesTable__row__item--heading BalancesTable__head__amount">Value (USD)</td>
          <td className="BalancesTable__head__cell BalancesTable__row__item--heading BalancesTable__head__amount"></td>
        </tr>
      </thead>
      <tbody>
        {balanceRows}
      </tbody>
    </table>
  }
}
