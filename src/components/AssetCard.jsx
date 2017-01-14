const React = window.React = require('react');
import Printify from '../lib/Printify';

export default class AssetCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let asset = this.props.asset;

    if (asset.isNative()) {
      return <div className="AssetCard">lumens</div>
    }

    return <div className="AssetCard">
      <div className="AssetCard__logo">
      </div>
      <div className="AssetCard__content">
        <div className="AssetCard__header">
          <span className="AssetCard__code">{this.props.asset.getCode()}</span>
          <a className="AssetCard__federation" href="https://stellarterm.com" target="_blank">stellarterm.com</a>
        </div>
        <p className="AssetCard__issuerAccountId">{this.props.asset.getIssuer()}</p>
      </div>
    </div>
  }
};
