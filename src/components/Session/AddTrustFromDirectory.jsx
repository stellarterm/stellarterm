const React = window.React = require('react');
import AssetCard from '../AssetCard.jsx';
import AddTrustFromDirectoryRow from './AddTrustFromDirectoryRow.jsx';
import directory from '../../directory';
import _ from 'lodash';

export default class AddTrustFromDirectory extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let asset = new StellarSdk.Asset('USD', 'GBZ3P4Z53Z7ZHATW6KCA2OXEBWKQGN2433WMSMKF7OJXWFJL4JT6NG4V');
    return <div className="so-back">
      <div className="island">
        <div className="island__header">
          Add trust from known anchors
        </div>
        <div className="island__paddedContent">
          <p>This is a list of anchors from the Stellar community. Note: StellarTerm does not endorse any of these anchors.</p>
        </div>
        <div className="AddTrustFromDirectory">
          <AddTrustFromDirectoryRow d={this.props.d} asset={asset}></AddTrustFromDirectoryRow>
        </div>
      </div>
    </div>
  }
}
