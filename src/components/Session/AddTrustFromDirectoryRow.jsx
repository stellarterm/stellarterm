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
    return <div className="AddTrustFromDirectoryRow">
      <div className="AddTrustFromDirectoryRow__asset">
        <AssetCard asset={this.props.asset} fixed={true}></AssetCard>
      </div>
      <div className="AddTrustFromDirectoryRow__options">
        <button className="s-button">Create trust line for {this.props.asset.getCode()}</button>
      </div>
    </div>
  }
}
