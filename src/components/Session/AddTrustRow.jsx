const React = window.React = require('react');
import AssetCard2 from '../AssetCard2.jsx';
import TrustButton from './TrustButton.jsx';
import _ from 'lodash';

export default class AddTrustRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="AddTrustRow row">
      <div className="row__assetCard2">
        <AssetCard2 code={this.props.asset.getCode()} issuer={this.props.asset.getIssuer()} />
      </div>
      <TrustButton
        d={this.props.d}
        asset={this.props.asset}
        message={this.props.asset.getCode() + " accepted"}
        trustMessage={"Accept " + this.props.asset.getCode()}
        />
    </div>
  }
}
