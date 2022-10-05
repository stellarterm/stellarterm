import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { Link } from 'react-router-dom';
import Driver from '../../../lib/driver/Driver';
import AssetCardMain from '../AssetCard/AssetCardMain/AssetCardMain';
import TrustButton from './TrustButton/TrustButton';
import Stellarify from '../../../lib/helpers/Stellarify';
import AssetCardSeparateLogo from '../AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';


export default class AssetRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: undefined,
        };
    }

    getRowActionButton(discoveredAsset) {
        if (this.props.tradeLink) {
            const native = new StellarSdk.Asset.native();
            return (
                <Link to={`/${Stellarify.pairToExchangeUrl(this.props.asset, native)}`} className="tradeLink">
                    {discoveredAsset}
                </Link>
            );
        }

        const messageText = this.props.hideMessage ? '' : `${this.props.asset.getCode()} accepted`;
        return (
            <TrustButton
                d={this.props.d}
                asset={this.props.asset}
                message={messageText}
                color={this.state.color}
            />
        );
    }

    render() {
        const { tradeLink } = this.props;


        const discoveredAsset = !tradeLink ? (
            <AssetCardSeparateLogo
                d={this.props.d}
                code={this.props.asset.getCode()}
                issuer={this.props.asset.getIssuer()}
                longIssuer
                color={this.state.color}
                boxy
            />) : (
            <AssetCardMain
                d={this.props.d}
                code={this.props.asset.getCode()}
                issuer={this.props.asset.getIssuer()}
                color={this.state.color}
            />);

        return !tradeLink ? (
            <div className="AssetRow">
                <div className="AssetRow_asset">
                    {discoveredAsset}
                </div>
                <div className="AssetRow_action">
                    {this.getRowActionButton()}
                </div>
            </div>
        ) : (
            this.getRowActionButton(discoveredAsset)
        );
    }
}

AssetRow.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
    tradeLink: PropTypes.bool,
    hideMessage: PropTypes.bool,
};
