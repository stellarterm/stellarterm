const React = window.React = require('react');
import Printify from '../lib/Printify';
import directory from '../directory';

// New code should use AssetCard2 instead of this AssetCard
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
    if (this.props.button) {
      containerClassName += ' AssetCard--button';
    }
    if (this.props.lit) {
      containerClassName += ' AssetCard--lit';
    }


    if (!asset) {
      // Blank card
      return <div className="AssetCard__main">
      </div>
    }

    let assetCardMain;

    let anchor;
    let issuerId = this.props.asset.getIssuer();
    let directoryAsset = directory.getAssetBySdkAsset(asset);
    if (directoryAsset === null) {
      anchor = directory.unknownAnchor;
    } else {
      anchor = directory.getAnchor(directoryAsset.domain);
    }

    let domainLink;
    if (!anchor.website || this.props.noLink) {
      domainLink = <span className="AssetCard__federation">{anchor.name}</span>
    } else {
      domainLink = <a className="AssetCard__federation" href={anchor.website} target="_blank">{anchor.name}</a>
    }

    let issuerAccountId;
    if (asset.isNative()) {
      issuerAccountId = <p className="AssetCard__issuerAccountId">native lumens</p>
    } else {
      issuerAccountId = <p className="AssetCard__issuerAccountId">{issuerId}</p>
    }
    assetCardMain = <div className="AssetCard__main">
      <div className="AssetCard__logo">
        <img className="AssetCard__logo__image" src={anchor.logo}></img>
      </div>
      <div className="AssetCard__content">
        <div className="AssetCard__header">
          <span className="AssetCard__code">{this.props.asset.getCode()}</span>
          {domainLink}
        </div>
        {issuerAccountId}
      </div>
    </div>

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
