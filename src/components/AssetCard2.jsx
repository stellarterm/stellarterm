const React = window.React = require('react');
import Printify from '../lib/Printify';
import directory from '../directory';


// Unlike AssetCard (original), this one does not link to the domain. Users can simply type it in the address bar
export default class AssetCard2 extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let containerClassName = 'AssetCard2';

    let assetCardMain;
    let asset;
    if (this.props.domain !== undefined) {
      asset = directory.getAsset(this.props.code, this.props.domain)
    } else if (this.props.issuer !== undefined) {
      asset = directory.getAsset(this.props.code, this.props.issuer)
    } else {
      throw new Error('AssetCard2 expects to get either domain or issuer');
    }

    let anchor = directory.getAnchor(asset.domain);

    console.log(asset)
    let issuerAccountId;
    if (asset.issuer === null) {
      issuerAccountId = <p className="AssetCard2__issuerAccountId">native lumens</p>
    } else {
      issuerAccountId = <p className="AssetCard2__issuerAccountId">{asset.issuer}</p>
    }
    assetCardMain = <div className="AssetCard2__main">
      <div className="AssetCard2__logo">
        <img className="AssetCard2__logo__image" src={anchor.logo}></img>
      </div>
      <div className="AssetCard2__content">
        <div className="AssetCard2__header">
          <span className="AssetCard2__header__code">{asset.code}</span>
          <span className="AssetCard2__header__domain">{anchor.name}</span>
        </div>
        {issuerAccountId}
      </div>
    </div>

    if (this.props.children) {
      containerClassName += ' AssetCard--container';
      return <div className={containerClassName}>
        {assetCardMain}
        <div className="AssetCard2__addon">
          {this.props.children}
        </div>
      </div>
    }
    return <div className={containerClassName}>
      {assetCardMain}
    </div>
  }
};
