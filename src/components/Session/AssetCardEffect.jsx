/*
  This file contains the Asset Card for Effects,
  essentially a copy of AssetCard2, but with added
  styles and slimmed down code. It is specifically
  designed for use in the Effect History Table: HistoryTable.jsx.
*/
const React = window.React = require('react');
import Printify from '../../lib/Printify';
import directory from '../../directory';

const decAtIndex = (input, index) => {
  return parseInt(input.substr(index,2),16);
}
const hexToRgba = (input, opacity) => {
  return 'rgba(' + decAtIndex(input, 1) + ',' + decAtIndex(input, 3) + ',' + decAtIndex(input, 5) + ',' + BACKGROUND_OPACITY + ')';
}

const BACKGROUND_OPACITY = 0.08;

export default class AssetEffectCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (!this.props.code) {
      throw new Error('EffectCard expects to get a code in the props. Instead, got: ' + this.props.code)
    }

    let asset = {};
    if (this.props.domain !== undefined) {
      asset = directory.getAssetByDomain(this.props.code, this.props.domain);
      if (asset === null) {
        throw new Error('EffectCard expects domains to point to a valid asset/anchor. Please do validation before calling EffectCard');
      }
    } else if (this.props.issuer !== undefined) {
      asset = directory.resolveAssetByAccountId(this.props.code, this.props.issuer);
    } else {
      throw new Error('EffectCard expects to get either domain or issuer');
    }

    let anchor = directory.getAnchor(asset.domain);
    let borderStyle = {};
    let backgroundStyle = {};
    if (anchor.color) {
      borderStyle.borderColor = anchor.color;
      let rgbaColor = hexToRgba(anchor.color, BACKGROUND_OPACITY);
      backgroundStyle.background = rgbaColor;
    }

    let issuerAccountId = (asset.issuer === null) ? 'native lumens' : asset.issuer;

    let assetCardMain = <div className="EffectCard__main" style={Object.assign(backgroundStyle, borderStyle)}>
      <img className="EffectCard__logo" src={anchor.logo}></img>
      <div className="EffectCard__content">
        <div className="EffectCard__header">
          <span className="EffectCard__header__code">{asset.code}</span>
          <span className="EffectCard__header__domain">{anchor.name}</span>
        </div>
        <p className="EffectCard__issuerAccountId">{issuerAccountId}</p>
      </div>
      {
        // This is only used for displaying amount of asset for trades.
        // If this prop is not present, this div will not be shown.
        this.props.amount ? <div className="EffectCard__container">
          <div>Amount: {Printify.lightenZeros(this.props.amount)}</div>
        </div> : <div></div>
      }
    </div>
    return assetCardMain

  }
};
