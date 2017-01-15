const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import AssetCard from '../AssetCard.jsx';
import _ from 'lodash';

export default class BalancesTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let account = this.props.d.session.account;
    let balances = [];
    account.balances.forEach(balance => {
      let balanceAsset = Stellarify.asset(balance);
      console.log(balance.limit)
      let limit = balance.limit == '922337203685.4775807' ? 'maximum': balance.limit;
      balances.push(<li key={balance.asset_issuer + balance.asset_code}>
          <AssetCard asset={balanceAsset} fixed={true}>
            Balance: {balance.balance} {balanceAsset.getCode()}
            Trust limit: {limit}
          </AssetCard>
      </li>)
    })
    let balancesList = <ul>{balances}</ul>

    // let trustLines = [];
    // account.balances.forEach(balance => {
    //   let removeButton;
    //   if (balance.balance === '0.0000000') {
    //     removeButton = <button onClick={() => this.props.d.handlers.removeTrust(balance.asset_code, balance.asset_issuer)}>Remove</button>
    //   } else {
    //     removeButton = <button disabled="true">Unable to remove trust line until balance is 0</button>
    //   }
    //   if (balance.asset_type !== 'native') {
    //     let limit = balance.limit == '922337203685.4775807' ? 'unlimited': balance.limit;
    //     trustLines.push(<li key={balance.asset_issuer + balance.asset_code}>
    //       <span>{balance.asset_code}: Issuer: {balance.asset_issuer} Limit: {limit}</span>
    //       {removeButton}
    //     </li>)
    //   }
    // })
    // let trustLinesList = <ul>{trustLines}</ul>

    return <div>
      {balancesList}
    </div>
  }
}
