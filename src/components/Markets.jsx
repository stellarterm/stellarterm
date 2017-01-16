const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';


let markets = [{
  baseBuying: StellarSdk.Asset.native(),
  counterSelling: new StellarSdk.Asset('USD', 'GBZ3P4Z53Z7ZHATW6KCA2OXEBWKQGN2433WMSMKF7OJXWFJL4JT6NG4V'),
}];

export default class Markets extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="island">
        <div className="OfferTables island__sub">
          <div className="OfferTables__tables island__sub__division">
            <h3 className="island__sub__division__title">Base asset</h3>
          </div>
          <div className="OfferTables__table island__sub__division">
            <h3 className="island__sub__division__title">Counter asset</h3>
          </div>
        </div>
        <a href="#exchange/XLM-native/USD-stellarterm.com" className="Markets__table__row">
          <div className="assetPair">
            <div className="assetPair__card">
              <AssetCard asset={markets[0].baseBuying}></AssetCard>
            </div>
            <div className="assetPair__separator"></div>
            <div className="assetPair__card">
              <AssetCard asset={markets[0].counterSelling}></AssetCard>
            </div>
          </div>
        </a>
      </div>
    );
  }
};
