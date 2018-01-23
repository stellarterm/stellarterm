const React = window.React = require('react');
import AssetCard2 from './AssetCard2.jsx';
import AssetPickerNarrow from './AssetPickerNarrow.jsx';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';

export default class AssetPair extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let baseCard;
    let counterCard;
    if (this.props.baseBuying !== null) {
      baseCard = <AssetCard2 code={this.props.baseBuying.getCode()} issuer={this.props.baseBuying.getIssuer()}></AssetCard2>
    }
    if (this.props.counterSelling !== null) {
      counterCard = <AssetCard2 code={this.props.counterSelling.getCode()} issuer={this.props.counterSelling.getIssuer()}></AssetCard2>
    }
    let content = <div className="AssetPair">
      <div className="AssetPair__card">
        {baseCard}
      </div>
      <div className="AssetPair__separator"></div>
      <div className="AssetPair__card">
        {counterCard}
      </div>
    </div>;

    if (this.props.row) {
      if (this.props.baseBuying && this.props.counterSelling) {
        let url = '#' + Stellarify.pairToExchangeUrl(this.props.baseBuying, this.props.counterSelling);
        // In the future, this can be split into AssetPairRow and AssetPair if the row is not needed
        return <a href={url} key={url} className="AssetPairRow">
          {content}
        </a>
      } else {
        return <div className="AssetPairRow">
          {content}
        </div>
      }
    }

    return content;
  }
};
