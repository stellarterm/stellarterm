const React = window.React = require('react');
import AssetCard from './AssetCard.jsx';
import AssetPair from './AssetPair.jsx';
import CustomMarketPicker from './CustomMarketPicker.jsx';
import Stellarify from '../lib/Stellarify';
import _ from 'lodash';


// FREEZE!
// Data is now in directory.js
let markets = [
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('CNY', 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('JPY', 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('XRP', 'GA7FCCMTTSUIC37PODEL6EOOSPDRILP6OQI5FWCWDDVDBLJV72W6RINZ'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('BTC', 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('BTC', 'GDXTJEK4JZNSTNQAWA53RZNS2GIKTDRPEUWDXELFMKU52XNECNVDVXDI'),
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
    baseBuying: new StellarSdk.Asset('MOBI', 'GDCIUCGL7VEMMF6VYJOW75KQ5ZCLHAQBRM6EPFTKCRWUYVUOOYQCKC5A'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('BTC', 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('LTC', 'GC5LOR3BK6KIOK7GKAUD5EGHQCMFOGHJTC7I3ELB66PTDFXORC2VM5LP'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('ICN', 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('NGN', 'GCLRUZDCWBHS7VIFCT43BARPP63BHR32HMEVKXYQODA5BU6SIGFK4HL2'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('GFT', 'GAAZUE4PKMKLA7QC2MPUIUXY7BZK2WUCK7Q5EELSDLK4FE3X4DZTSCKN'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('EQD', 'GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN'),
  },
  {
    baseBuying: new StellarSdk.Asset('BTC', 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH'),
    counterSelling: new StellarSdk.Asset('EQD', 'GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN'),
  },
  {
    baseBuying: new StellarSdk.Asset('EURT', 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S'),
    counterSelling: new StellarSdk.Asset('PHP', 'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP'),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('PHP', 'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP'),
  },
  {
    baseBuying: new StellarSdk.Asset('SEED', 'GDPFSEBZO2W4TLWZO7FIMMG3QONHXYVF6LUULI6HUJS6PJLE4TRZEXLF'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: new StellarSdk.Asset('CM3', 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: new StellarSdk.Asset('CM10', 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: new StellarSdk.Asset('CME', 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: new StellarSdk.Asset('CM3x2', 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: new StellarSdk.Asset('HKDC', 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3'),
    counterSelling: StellarSdk.Asset.native(),
  },
  {
    baseBuying: StellarSdk.Asset.native(),
    counterSelling: new StellarSdk.Asset('XLQ', 'GD2RRX6BKVTORZ6RIMBLWFVUOAYOLTS2QFJQUQPXLI3PBHR3TMLQNGZX'),
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
        <div className="so-back islandBack">
          <CustomMarketPicker row={true}></CustomMarketPicker>
        </div>
      </div>
    );
  }
};
