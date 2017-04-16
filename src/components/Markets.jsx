const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import AssetPair from './AssetPair.jsx';
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
    counterSelling: new StellarSdk.Asset('EURT', 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S'),
  },
  {
    baseBuying: new StellarSdk.Asset('BTC', 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'),
    counterSelling: new StellarSdk.Asset('EURT', 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('CNY', 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('PHP', 'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('JPY', 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM'),
  },
];

export default class Markets extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let rows = [];
    _.each(markets, (market, index) => {
      rows.push(<AssetPair key={index} row={true} baseBuying={market.baseBuying} counterSelling={market.counterSelling}></AssetPair>)
    })
    return (
      <div>
        <div className="so-back islandBack islandBack--t">
          <CustomMarketPicker row={true}></CustomMarketPicker>
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
