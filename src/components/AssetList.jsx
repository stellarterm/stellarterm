const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import directory from '../directory.js';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';


export default class AssetList extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenTicker(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.props.d.unlistenTicker(this.listenId);
  }
  render() {
    let d = this.props.d;
    if (!d.ticker.ready) {
      return <div>
        Loading
      </div>
    }

    let rows = [];
    _.each(d.ticker.assets, (asset, index) => {
      console.log(asset.id);
      let sdkAsset = new StellarSdk.Asset(asset.code, asset.issuer);
      rows.push(<div key={asset.id}><AssetCard asset={sdkAsset} noLink={true}></AssetCard></div>);
      // rows.push(<AssetPair key={index} row={true} baseBuying={market.baseBuying} counterSelling={market.counterSelling}></AssetPair>)
    })
    return (
      <div>
        {rows}
      </div>
    );
  }
};
