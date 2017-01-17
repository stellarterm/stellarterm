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
    let rows = [];
    _.each(directory.getAllSources(), source => {
      _.each(source.assets, assetObj => {
        let asset = new StellarSdk.Asset(assetObj.code, assetObj.issuer);
        const key = assetObj.code + assetObj.issuer;
        rows.push(<AddTrustFromDirectoryRow key={key} d={this.props.d} asset={asset}></AddTrustFromDirectoryRow>);
      })
    })
    return <div className="island">
      <div className="island__header">
        Add trust from known anchors
      </div>
      <div className="island__paddedContent">
        <p>This is a list of anchors from the Stellar community.<br />Note: StellarTerm does not endorse any of these anchors.</p>
      </div>
      <div className="AddTrustFromDirectory">
        {rows}
      </div>
    </div>
  }
}
