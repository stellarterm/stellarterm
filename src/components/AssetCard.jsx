const React = window.React = require('react');
import Printify from '../lib/Printify';
import directory from '../directory';

export default class AssetCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let asset = this.props.asset;

    if (asset.isNative()) {
      return <div className="AssetCard">
        <div className="AssetCard__logo">
        <img className="AssetCard__logo__image" src={directory.data['Stellar Network'].logo}></img>
        </div>
        <div className="AssetCard__content">
          <div className="AssetCard__header">
            <span className="AssetCard__code">{this.props.asset.getCode()}</span>
            <span className="AssetCard__federation">Stellar Network</span>
          </div>
          <p className="AssetCard__issuerAccountId">native lumens</p>
        </div>
      </div>
    }

    return <div className="AssetCard">
      <div className="AssetCard__logo">
        <img className="AssetCard__logo__image" src={directory.data['stellarterm.com'].logo}></img>
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
