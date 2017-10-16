const React = window.React = require('react');
import AssetCard2 from '../../AssetCard2.jsx';
import TrustButton from '../TrustButton.jsx';
import directory from '../../../directory';
import _ from 'lodash';

export default class DepositAnchors extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let rows = [];
    _.each(directory.anchors, anchor => {
      _.each(anchor.assets, assetId => {
        const assetParts = assetId.split('-');
        const assetCode = assetParts[0];

        if (assetCode === this.props.selectedAssetCode) {
          const assetIssuer = assetParts[1];
          const name = anchor.name;
          const asset = new StellarSdk.Asset(assetCode, assetIssuer);
          // TODO NNS 2 - we will need to update the directory to add the deposit instructions, this may require updating the datamodel
          const row = (<tr className="row BalancesTable__row" key={name + "_" + assetCode + "_" + assetIssuer}>
              <td className="BalancesTable__row__item BalancesTable__row__item--assetCard">
                <AssetCard2 code={assetCode} issuer={assetIssuer}/>
              </td>
              <td className="BalancesTable__row__item BalancesTable__row__item--amount">
                <TrustButton d={this.props.d} asset={asset} message="Coming soon..."/>
              </td>
            </tr>);
          rows.push(row);
        }
      });
    });

    return (<div className="island">
      <div className="island__header">
        Anchors accepting deposits
      </div>
      <div className="island__paddedContent">
        <p>This is a list of anchors from the Stellar community.<br/>
        Note: StellarTerm does not endorse any of these anchors.</p>
      </div>
      <div>
        <table className="BalancesTable">
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    </div>);
  }
}
