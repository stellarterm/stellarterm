import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Driver from '../../../../../lib/Driver';
import AssetCard from '../../../../AssetCard';
import TrustButton from '../../../TrustButton';

export default class ManuallyAddTrust extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trustCode: '',
            trustIssuer: '',
            unknownAssetData: '',
            isDataUpdate: false,
        };
    }

    async loadUnknownData(asset) {
        if (!this.state.isDataUpdate) {
            const unknownAssetData = await this.props.d.session.account.loadUnknownAssetData(asset);
            this.setState({
                unknownAssetData,
                isDataUpdate: true,
            });
        }
    }

    handleInput(event, trustType) {
        this.setState({
            [trustType]: event.target.value.toUpperCase(),
            isDataUpdate: false,
        });
    }

    checkForInputErrors() {
        const inputErrors = [];
        const { trustCode, trustIssuer } = this.state;

        if (trustCode.length > 12) {
            inputErrors.push('Asset code must be 12 or fewer characters');
        }
        if (!trustCode.match(/^[a-zA-Z0-9]+$/g)) {
            inputErrors.push('Asset code must contain only letters and/or numbers');
        }
        if (!StellarSdk.StrKey.isValidEd25519PublicKey(trustIssuer)) {
            inputErrors.push('Asset issuer account ID must be a valid account ID');
        }

        if (inputErrors.length) {
            return (
                <React.Fragment>
                    <div className="island__separator" />
                    <div className="AddTrust__confirmation">
                        <div className="s-alert s-alert--alert">
                            <ul className="AddTrust__errorList">
                                {_.map(inputErrors, (errorMessage, index) => (
                                    <li key={index}>{errorMessage}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </React.Fragment>
            );
        }

        const asset = new StellarSdk.Asset(trustCode, trustIssuer);
        this.loadUnknownData(asset);

        return (
            <React.Fragment>
                <div className="island__separator" />
                <div className="AddTrust__confirmation">
                    <div className="AddTrust__confirmation__assetCard">
                        <AssetCard
                            asset={asset}
                            fixed
                            currency={this.state.unknownAssetData.currency}
                            host={this.state.unknownAssetData.host} />
                    </div>
                    <TrustButton
                        isManualTrust
                        d={this.props.d}
                        asset={asset}
                        message={`${asset.getCode()} accepted`}
                        color={this.state.unknownAssetData.color}
                        currency={this.state.unknownAssetData.currency}
                        host={this.state.unknownAssetData.host}
                        trustMessage={`Accept asset ${asset.getCode()}`} />
                </div>
            </React.Fragment>
        );
    }

    render() {
        const { trustCode, trustIssuer } = this.state;
        const inputsAreNotEmpty = trustCode !== '' && trustIssuer !== '';

        return (
            <div className="island">
                <div className="island__header">Manually accept asset</div>

                <div className="island__paddedContent">
                    <p>You can accept an asset if you know the issuer account ID and asset code.</p>
                    <label className="s-inputGroup AddTrust__inputGroup" htmlFor="inputManuallyAssetCode">
                        <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                            <span>Asset Code</span>
                        </span>

                        <input
                            className="s-inputGroup__item S-flexItem-share"
                            name="inputManuallyAssetCode"
                            type="text"
                            value={trustCode}
                            onChange={e => this.handleInput(e, 'trustCode')}
                            placeholder="Asset code (example: BTC)" />
                    </label>

                    <label className="s-inputGroup AddTrust__inputGroup" htmlFor="inputManuallyIssuer">
                        <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                            <span>Issuer Account ID</span>
                        </span>

                        <input
                            className="s-inputGroup__item S-flexItem-share"
                            name="inputManuallyIssuer"
                            type="text"
                            value={trustIssuer}
                            onChange={e => this.handleInput(e, 'trustIssuer')}
                            placeholder="Asset Issuer
                            (example: GC4DJYMFQZVX3R56FVCN3WA7FJFKT24VI67ODTZUENSE4YNUXZ3WYI7R)" />
                    </label>
                </div>

                {inputsAreNotEmpty ? this.checkForInputErrors() : ''}
            </div>
        );
    }
}

ManuallyAddTrust.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
