const React = window.React = require('react');
import _ from 'lodash';
import Validate from '../lib/Validate';
import directory from '../directory';


export default class AssetPickerNarrow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      issuer: '',
    }

    this.handleInput = (type, e) => {
      e.preventDefault();
      let newState = _.assign({}, this.state)
      if (type === 'code') {
        newState.code = e.target.value.toUpperCase();
      } else {
        newState.issuer = e.target.value;
      }
      this.setState(newState)
      let result = this.checkInputs(newState);
      this.props.onUpdate(result);
    }
  }
  checkInputs(newState) {
    let assetCodeValid = Validate.assetCode(newState.code);
    let resolvedIssuer = undefined; // null is for XLM

    if (Validate.publicKey(newState.issuer).ready) {
      resolvedIssuer = newState.issuer;
    } else {
      let source = directory.getSourceByFederation(newState.issuer);
      if (source.name !== 'unknown') {
        _.each(source.assets, asset => {
          if (asset.code === newState.code) {
            resolvedIssuer = asset.issuer;
          }
        })
      }
    }

    if (resolvedIssuer === undefined && newState.code === 'XLM') {
      resolvedIssuer = null;
    }

    if (assetCodeValid && resolvedIssuer !== undefined) {
      return new StellarSdk.Asset(newState.code, resolvedIssuer);
    }
    return null;
  }
  render() {
    return <div>
      <label className="s-inputGroup AssetPickerNarrow__inputGroup AssetPickerNarrow__code">
        <span className="s-inputGroup__item AssetPickerNarrow__tag s-inputGroup__item--tag S-flexItem-full">
          <span>Asset Code</span>
        </span>
        <input className="s-inputGroup__item AssetPickerNarrow__input S-flexItem-full" type="text" value={this.state.code} onChange={e => this.handleInput('code', e)} placeholder="example: XLM" />
      </label>
      <label className="s-inputGroup AssetPickerNarrow__inputGroup AssetPickerNarrow__issuer">
        <span className="s-inputGroup__item AssetPickerNarrow__tag s-inputGroup__item--tag S-flexItem-full">
          <span>Issuer Account ID or federation</span>
        </span>
        <input className="s-inputGroup__item AssetPickerNarrow__input S-flexItem-full" type="text" value={this.state.issuer} onChange={e => this.handleInput('issuer', e)} placeholder="example: naobtc.com or GC4DJYMFQZVX3R56FVCN3WA7FJFKT24VI67ODTZUENSE4YNUXZ3WYI7R" />
      </label>
    </div>
  }
};
