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
    let issuerId = this.props.asset.getIssuer();
    let source = directory.getSourceById(issuerId);

    let federationlink;
    if (!source.website || this.props.noLink) {
      federationlink = <span className="AssetCard__federation">{source.name}</span>
    } else {
      federationlink = <a className="AssetCard__federation" href={source.website} target="_blank">{source.name}</a>
    }

    let issuerAccountId;
    if (asset.isNative()) {
      issuerAccountId = <p className="AssetCard__issuerAccountId">native lumens</p>
    } else {
      issuerAccountId = <p className="AssetCard__issuerAccountId">{issuerId}</p>
    }
    assetCardMain = <div className="AssetCard__main">
      <div className="AssetCard__logo">
        <img className="AssetCard__logo__image" src={source.logo}></img>
      </div>
      <div className="AssetCard__content">
        <div className="AssetCard__header">
          <span className="AssetCard__code">{this.props.asset.getCode()}</span>
          {federationlink}
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
