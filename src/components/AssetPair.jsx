const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import AssetPickerNarrow from './AssetPickerNarrow.jsx';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';

export default class AssetPair extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let content = <div className="AssetPair">
      <div className="AssetPair__card">
        <AssetCard asset={this.props.baseBuying} noLink={true}></AssetCard>
      </div>
      <div className="AssetPair__separator"></div>
      <div className="AssetPair__card">
        <AssetCard asset={this.props.counterSelling} noLink={true}></AssetCard>
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
