const React = window.React = require('react');
import Printify from '../lib/Printify';
import directory from '../directory';

export default class AssetCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let asset = this.props.asset;
    let containerClassName = 'AssetCard';
    if (this.props.fixed) {
      containerClassName += ' AssetCard--fixed';
    }

    let assetCardMain;
    if (asset.isNative()) {
      assetCardMain = <div className="AssetCard__main">
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
    } else {
      assetCardMain = <div className="AssetCard__main">
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


    if (this.props.children) {
      containerClassName += ' AssetCard--container';
      return <div className={containerClassName}>
        {assetCardMain}
        <div className="AssetCard__addon">
          {this.props.children}
        </div>
      </div>
    }
    return <div className={containerClassName}>
      {assetCardMain}
    </div>
  }
};
