const React = window.React = require('react');
import Printify from '../lib/Printify';

export default class AssetCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div className="AssetCard">
      {Printify.assetName(this.props.asset)}
    </div>
  }
};
