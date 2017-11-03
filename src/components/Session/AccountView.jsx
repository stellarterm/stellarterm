const React = window.React = require('react');
import Stellarify from '../../lib/Stellarify';
import Printify from '../../lib/Printify';
import BalancesTable from './BalancesTable.jsx';
import MinBalance from './MinBalance.jsx';
import _ from 'lodash';

export default class AccountView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>
      <div className="so-back islandBack">
        <div className="island">
          <div className="island__header">
            Balances
          </div>
          <BalancesTable d={this.props.d}></BalancesTable>
        </div>
      </div>
      <div className="so-back islandBack">
        <div className="island">
          <div className="island__header">
            Minimum Balance
          </div>
          <MinBalance d={this.props.d}></MinBalance>
        </div>
      </div>
    </div>
  }
}
