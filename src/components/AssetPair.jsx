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
    let content = <div className="assetPair">
      <div className="assetPair__card">
        <AssetCard asset={this.props.baseBuying} noLink={true}></AssetCard>
      </div>
      <div className="assetPair__separator"></div>
      <div className="assetPair__card">
        <AssetCard asset={this.props.counterSelling} noLink={true}></AssetCard>
      </div>
    </div>
    if (this.props.baseBuying && this.props.counterSelling) {
      let url = '#' + Stellarify.pairToExchangeUrl(this.props.baseBuying, this.props.counterSelling);
      return <a href={url} key={url} className="Markets__table__row">
        {content}
      </a>
    } else {
      return <div className="Markets__table__row">
        {content}
      </div>
    }
  }
};
