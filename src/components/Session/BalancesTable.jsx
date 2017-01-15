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

      let removeLink;
      if (balance.balance === '0.0000000') {
        removeLink = <button onClick={() => this.props.d.handlers.removeTrust(balance.asset_code, balance.asset_issuer)}>Remove</button>
      } else {
        removeLink = <button disabled="true">Unable to remove trust line until balance is 0</button>
      }
      balanceCards.push(<AssetCard key={balance.asset_issuer + balance.asset_code} asset={balanceAsset} fixed={true}>
        Balance: {balance.balance} {balanceAsset.getCode()}
        Trust limit: {limit}
        {removeLink}
      </AssetCard>);
    })

    return <div>
      {balanceCards}
    </div>
  }
}
