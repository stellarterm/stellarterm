import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Validate from '../lib/Validate';
import directory from '../directory';

export default class AssetPickerNarrow extends React.Component {
    static checkInputs({ inputCode: code, inputIssuer: issuer }) {
        const isXlmNative = code === 'XLM' && issuer === '';

        if (isXlmNative) {
            return StellarSdk.Asset.native();
        }

        const assetByAccountId = directory.getAssetByAccountId(code, issuer);
        if (assetByAccountId !== null) {
            return new StellarSdk.Asset(assetByAccountId.code, assetByAccountId.issuer);
        }

        const assetByDomain = directory.getAssetByDomain(code, issuer);
        if (assetByDomain !== null) {
            return new StellarSdk.Asset(assetByDomain.code, assetByDomain.issuer);
        }

        const isValidAsset = Validate.publicKey(issuer).ready && Validate.assetCode(code);
        if (isValidAsset) {
            return new StellarSdk.Asset(code, issuer);
        }
        return null;
    }

    constructor(props) {
        super(props);
        this.state = {
            inputCode: '',
            inputIssuer: '',
        };
    }

    getAssetPickerInput(isCode) {
        const { inputCode, inputIssuer } = this.state;

        return (
            <label className="s-inputGroup AssetPickerNarrow" htmlFor={isCode ? 'inputCode' : 'inputIssuer'}>
                <span className="s-inputGroup__item AssetPickerNarrow_tag s-inputGroup__item--tag S-flexItem-full">
                    <span>{isCode ? 'Asset Code' : 'Issuer Account ID or federation'}</span>
                </span>
                <input
                    className="s-inputGroup__item S-flexItem-full"
                    type="text"
                    name={isCode ? 'inputCode' : 'inputIssuer'}
                    value={isCode ? inputCode : inputIssuer}
                    onChange={e => this.handleInput(e)}
                    placeholder={
                        isCode
                            ? 'example: XLM'
                            : 'example: naobtc.com or GC4DJYMFQZVX3R56FVCN3WA7FJFKT24VI67ODTZUENSE4YNUXZ3WYI7R'
                    } />
            </label>
        );
    }

    handleInput({ target }) {
        const newState = _.assign({}, this.state);
        const { name, value } = target;

        if (name === 'inputCode') {
            newState.inputCode = value;
        } else {
            newState.inputIssuer = value;
        }
        this.setState(newState);
        this.props.onUpdate(this.constructor.checkInputs(newState));
    }

    render() {
        return (
            <React.Fragment>
                {this.getAssetPickerInput(true)}
                {this.getAssetPickerInput(false)}
            </React.Fragment>
        );
    }
}

AssetPickerNarrow.propTypes = {
    onUpdate: PropTypes.func.isRequired,
};
