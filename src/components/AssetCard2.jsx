const React = window.React = require('react');
import Printify from '../lib/Printify';
import directory from '../directory';

// This is AssetCard2, the preferred way of displaying an asset in stellarterm.
// The parent container should be 340px or wider

// Options
//  - boxy: removes the rounded borders

// You may also pass in children elements to sit nicely with the AssetCard2.
// The children elements are responsible for padding within the AssetCard

const decAtIndex = (input, index) => {
  return parseInt(input.substr(index,2),16);
}
const hexToRgba = (input, opacity) => {
  return 'rgba(' + decAtIndex(input, 1) + ',' + decAtIndex(input, 3) + ',' + decAtIndex(input, 5) + ',' + BACKGROUND_OPACITY + ')';
}

const BACKGROUND_OPACITY = 0.08;

export default class AssetCard2 extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (!this.props.code) {
      throw new Error('AssetCard2 expects to get a code in the props. Instead, got: ' + this.props.code)
    }

    let asset = {};
    if (this.props.code === 'XLM' && this.props.domain === undefined && this.props.issuer === undefined) {
      asset = directory.nativeAsset;
    } else {
      if (this.props.domain !== undefined) {
        asset = directory.getAssetByDomain(this.props.code, this.props.domain);
        if (asset === null) {
          throw new Error('AssetCard2 expects domains to point to a valid asset/anchor. Please do validation before calling AssetCard2');
        }
      } else if (this.props.issuer !== undefined) {
        asset = directory.resolveAssetByAccountId(this.props.code, this.props.issuer);
      } else {
        throw new Error('AssetCard2 expects to get either domain or issuer. Input code: ' + this.props.code + ' Domain: ' + this.props.domain + ' Issuer: ' + this.props.issuer);
      }
    }

    let anchor = directory.getAnchor(asset.domain);
    let borderStyle = {};
    let backgroundStyle = {};
    if (anchor.color) {
      borderStyle.borderColor = anchor.color;
      let rgbaColor = hexToRgba(anchor.color, BACKGROUND_OPACITY);
      backgroundStyle.background = rgbaColor;
    }

    let issuerAccountId = (asset.issuer === null) ? 'native lumens' : asset.issuer.substr(0,12) + '.........' + asset.issuer.substr(-12,12);
    // Unlike AssetCard (original), this one does not link to the domain. Users can simply type it in the address bar

    let assetCardMain = <div className="AssetCard2__main" style={backgroundStyle}>
      <img className="AssetCard2__logo" src={anchor.logo}></img>
      <div className="AssetCard2__content">
        <div className="AssetCard2__header">
          <span className="AssetCard2__header__code">{asset.code}</span>
          <span className="AssetCard2__header__domain">{anchor.name}</span>
        </div>
        <p className="AssetCard2__issuerAccountId">Issuer (<strong>not you</strong>): {issuerAccountId}</p>
      </div>
    </div>

    let containerClassName = 'AssetCard2';

    if (this.props.boxy) {
      containerClassName += ' AssetCard2--boxy';
    }

    if (this.props.children) {
      containerClassName += ' AssetCard2--container';
      return <div className={containerClassName} style={borderStyle}>
        {assetCardMain}
        <div className="AssetCard2__addon" style={Object.assign({}, borderStyle, backgroundStyle)}>
          {this.props.children}
        </div>
      </div>
    }

    return <div className={containerClassName} style={borderStyle}>
      {assetCardMain}
    </div>
  }
};
