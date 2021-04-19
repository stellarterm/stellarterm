import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { Link } from 'react-router-dom';
import directory from 'stellarterm-directory';
import Driver from '../../../lib/Driver';
import AssetCardMain from '../AssetCard/AssetCardMain/AssetCardMain';
import TrustButton from './TrustButton/TrustButton';
import Stellarify from '../../../lib/Stellarify';
import AssetCardSeparateLogo from '../AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';


export default class AssetRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: undefined,
        };
    }

    componentDidMount() {
        const { currency } = this.props;
        const hasAssetInDirectory = currency && !!directory.getAssetByAccountId(currency.code, currency.issuer);
        if (currency && currency.image && !hasAssetInDirectory) {
            this.getColor(currency);
        }
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
                currency={this.props.currency}
                color={this.state.color}
                host={this.props.host} />
        );
    }

    async getColor({ image }) {
        const color = await this.props.d.session.handlers.getAverageColor(
            image,
            this.props.asset.getCode(),
            this.props.host,
        );
        this.setState({ color });
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
                currency={this.props.currency}
                boxy
                host={this.props.host} />) : (
            <AssetCardMain
                d={this.props.d}
                code={this.props.asset.getCode()}
                issuer={this.props.asset.getIssuer()}
                color={this.state.color}
                currency={this.props.currency}
                host={this.props.host} />);

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
    host: PropTypes.string,
    tradeLink: PropTypes.bool,
    currency: PropTypes.shape({
        image: PropTypes.string,
        host: PropTypes.string,
    }),
    hideMessage: PropTypes.bool,
};
