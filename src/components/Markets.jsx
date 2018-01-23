const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import AssetPair from './AssetPair.jsx';
import AssetList from './AssetList.jsx';
import CustomMarketPicker from './CustomMarketPicker.jsx';
import Stellarify from '../lib/Stellarify';
import ErrorBoundary from './ErrorBoundary.jsx';
import _ from 'lodash';


export default class Markets extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <div className="so-back islandBack islandBack--t">
          <div className="island">
            <div className="island__header">
              Stellar Asset Directory
            </div>
            <AssetList d={this.props.d}></AssetList>
          </div>
        </div>
        <ErrorBoundary>
          <div className="so-back islandBack">
            <CustomMarketPicker row={true}></CustomMarketPicker>
          </div>
        </ErrorBoundary>
      </div>
    );
  }
};
