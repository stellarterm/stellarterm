const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import CustomMarketPicker from './CustomMarketPicker.jsx';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';

let markets = [
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('DEMO', 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('BTC', 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('JPY', 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('CNY', 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX'),
  },
  {
    baseBuying: new StellarSdk.Asset('BTC', 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'),
    counterSelling: new StellarSdk.Asset('EUR', 'GDI73WJ4SX7LOG3XZDJC3KCK6ED6E5NBYK2JUBQSPBCNNWEG3ZN7T75U'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('EUR', 'GDI73WJ4SX7LOG3XZDJC3KCK6ED6E5NBYK2JUBQSPBCNNWEG3ZN7T75U'),
  },
];

export default class Markets extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let rows = [];
    _.each(markets, market => {
      let url = '#' + Stellarify.pairToExchangeUrl(market.baseBuying, market.counterSelling);
      rows.push(
        <a href={url} key={url} className="Markets__table__row">
          <div className="assetPair">
            <div className="assetPair__card">
              <AssetCard asset={market.baseBuying} noLink={true}></AssetCard>
            </div>
            <div className="assetPair__separator"></div>
            <div className="assetPair__card">
              <AssetCard asset={market.counterSelling} noLink={true}></AssetCard>
            </div>
          </div>
        </a>
      )
    })
    return (
      <div>
        <div className="so-back islandBack islandBack--t">
          <CustomMarketPicker></CustomMarketPicker>
        </div>
        <div className="so-back islandBack">
          <div className="island">
            <div className="island__header">
              Popular exchange markets
            </div>
            <div className="island__sub">
              <div className="island__sub__division">
                <h3 className="island__sub__division__title">Base asset</h3>
              </div>
              <div className="island__sub__division">
                <h3 className="island__sub__division__title">Counter asset</h3>
              </div>
            </div>
            {rows}
          </div>
        </div>
      </div>
    );
  }
};
