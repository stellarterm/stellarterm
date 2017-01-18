const React = window.React = require('react');
import AddTrustFromDirectoryRow from './AddTrustFromDirectoryRow.jsx';
import Stellarify from '../../lib/Stellarify';
import _ from 'lodash';

export default class AddTrustFromFederation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      federation: '',
      currencies: [],
      state: 'initial', // States: initial, pending, found, notfound
    };

    this.handleInputFederation = event => {
      let fedValue = event.target.value;
      this.setState({
        federation: fedValue,
        state: 'pending',
        currencies: [],
      });

      StellarSdk.StellarTomlResolver.resolve(fedValue)
      .then(res => {
        if (fedValue !== this.state.federation) {
          return;
        }
        console.log('found',res);
        this.setState({
          federation: fedValue,
          state: 'found',
          currencies: res.CURRENCIES,
        });
      })
      .catch(err => {
        if (fedValue !== this.state.federation) {
          return;
        }
        this.setState({
          federation: fedValue,
          state: 'notfound',
          currencies: [],
        });
        console.log('err', err);
      })
    }
    // this.handleSubmitTrust = (event) => {
    //   event.preventDefault();
    //   this.props.d.handlers.addTrust(this.state.trustCode, this.state.trustIssuer);
    // }
  }

  render() {
    // let confirmation;
    // if (this.state.trustCode !== '' && this.state.trustIssuer !== '') {
    //   let errors = [];
    //   let trustCode = this.state.trustCode;
    //   if (trustCode.length > 12) {
    //     errors.push('Asset code must be 12 or fewer characters');
    //   }
    //   if (!trustCode.match(/^[a-zA-Z0-9]+$/g)) {
    //     errors.push('Asset code must contain only letters and/or numbers');
    //   }
    //   if (!StellarSdk.Keypair.isValidPublicKey(this.state.trustIssuer)) {
    //     errors.push('Asset issuer account ID must be a valid account ID');
    //   }

    //   if (errors.length) {
    //     confirmation = <div>
    //       <div className="island__separator"></div>
    //       <div className="AddTrust__confirmation">
    //         <div className="s-alert s-alert--alert">
    //           <ul className="AddTrust__errorList">
    //             {_.map(errors, (errorMessage, index) => {
    //               return <li key={index}>{errorMessage}</li>;
    //             })}
    //           </ul>
    //         </div>
    //       </div>
    //     </div>
    //   } else {
    //     let found = false;
    //     _.each(this.props.d.session.account.balances, balance => {
    //       if (balance.asset_code === this.state.trustCode && balance.asset_issuer === this.state.trustIssuer) {
    //         found = true;
    //       }
    //     });

    //     let createButton;
    //     if (found) {
    //       createButton = <button disabled={true} className="s-button">Trust line for {this.state.trustCode} exists</button>
    //     } else {
    //       createButton = <button className="s-button">Create trust line for {this.state.trustCode}</button>
    //     }

    //     let asset = new StellarSdk.Asset(this.state.trustCode, this.state.trustIssuer);
    //     confirmation = <div>
    //       <div className="island__separator"></div>
    //       <div className="AddTrust__confirmation">
    //         <div className="AddTrust__confirmation__assetCard">
    //           <AssetCard asset={asset} fixed={true}></AssetCard>
    //         </div>
    //         {createButton}
    //       </div>
    //     </div>
    //   }
    // }
    let rows = _.map(this.state.currencies, currency => {
      let asset = Stellarify.assetToml(currency);
      const key = currency.code + currency.issuer;
      return <AddTrustFromDirectoryRow key={key} d={this.props.d} asset={asset}></AddTrustFromDirectoryRow>;
    })


    return <div className="island">
      <div className="island__header">
        Add trust via federation
      </div>
      <div className="island__paddedContent">
        <p>You can add trust using the federation url.</p>
        <label className="s-inputGroup AddTrust__inputGroup">
          <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
            <span>Federation URL</span>
          </span>
          <input className="s-inputGroup__item S-flexItem-share" type="text" value={this.state.federation} onChange={this.handleInputFederation} placeholder="example: coins.asia" />
        </label>
      </div>
      <div className="AddTrustFromDirectory">
        {rows}
      </div>
    </div>
  }
}
