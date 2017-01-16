const React = window.React = require('react');
import AssetPair from './AssetPair.jsx';
import AssetPickerNarrow from './AssetPickerNarrow.jsx';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';

export default class CustomMarketPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseBuying: null,
      counterSelling: null
    }

    this.baseBuyingUpdate = (asset) => {
      this.setState({
        baseBuying: asset,
      });
    }
    this.counterSellingUpdate = (asset) => {
      this.setState({
        counterSelling: asset,
      });
    }
  }
  render() {
    let pair;
    if (this.state.baseBuying || this.state.counterSelling) {
      pair = <AssetPair baseBuying={this.state.baseBuying} counterSelling={this.state.counterSelling}></AssetPair>
    }

    return (
      <div className="island">
        <div className="island__header">
          Custom exchange pair
        </div>
        <div className="island__sub">
          <div className="island__sub__division">
            <h3 className="island__sub__division__title">Base asset</h3>
          </div>
          <div className="island__sub__division">
            <h3 className="island__sub__division__title">Counter asset</h3>
          </div>
        </div>
        <div className="island__sub">
          <div className="island__sub__division">
            <AssetPickerNarrow onUpdate={this.baseBuyingUpdate}></AssetPickerNarrow>
          </div>
          <div className="island__sub__division">
            <AssetPickerNarrow onUpdate={this.counterSellingUpdate}></AssetPickerNarrow>
          </div>
        </div>
        <div className="CustomMarketPicker__results">
          {pair}
        </div>
      </div>
    );
  }
};
