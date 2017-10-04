const React = window.React = require('react');
import Printify from '../lib/Printify';
import directory from '../directory';

// This is AssetCard2, the preferred way of displaying an asset in stellarterm.
// The parent container should be 340px or wider

// Options
//  - boxy: removes the rounded borders

// You may also pass in children elements to sit nicely with the AssetCard2.
// The children elements are responsible for padding within the AssetCard

export default class AssetCard2 extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let asset;
    if (this.props.domain !== undefined) {
      asset = directory.getAsset(this.props.code, this.props.domain)
    } else if (this.props.issuer !== undefined) {
      asset = directory.getAsset(this.props.code, this.props.issuer)
    } else {
      throw new Error('AssetCard2 expects to get either domain or issuer');
    }

    let anchor = directory.getAnchor(asset.domain);
    let issuerAccountId = (asset.issuer === null) ? 'native lumens' : asset.issuer;
    // Unlike AssetCard (original), this one does not link to the domain. Users can simply type it in the address bar

    let assetCardMain = <div className="AssetCard2__main">
      <img className="AssetCard2__logo" src={anchor.logo}></img>
      <div className="AssetCard2__content">
        <div className="AssetCard2__header">
          <span className="AssetCard2__header__code">{asset.code}</span>
          <span className="AssetCard2__header__domain">{anchor.name}</span>
        </div>
        <p className="AssetCard2__issuerAccountId">{issuerAccountId}</p>
      </div>
    </div>

    let containerClassName = 'AssetCard2';


    if (this.props.boxy) {
      containerClassName += ' AssetCard2--boxy';
    }

    if (this.props.children) {
      containerClassName += ' AssetCard2--container';
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
