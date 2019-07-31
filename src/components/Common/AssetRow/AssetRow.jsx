import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import directory from 'stellarterm-directory';
import Driver from '../../../lib/Driver';
import AssetCard2 from '../../Common/AssetCard2/AssetCard2';
import TrustButton from './TrustButton/TrustButton';
import Stellarify from '../../../lib/Stellarify';

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

    getRowActionButton() {
        if (this.props.tradeLink) {
            const native = new StellarSdk.Asset.native();
            return (
                <Link
                    to={`/${Stellarify.pairToExchangeUrl(this.props.asset, native)}`}
                    className="tradeLink">
                        trade
                </Link>
            );
        }

        return (
            <TrustButton
                d={this.props.d}
                asset={this.props.asset}
                message={`${this.props.asset.getCode()} accepted`}
                trustMessage={`Accept ${this.props.asset.getCode()}`}
                currency={this.props.currency}
                color={this.state.color}
                host={this.props.host} />
        );
    }

    async getColor({ image }) {
        const color =
            await this.props.d.session.handlers.getAverageColor(image, this.props.asset.getCode(), this.props.host);
        this.setState({ color });
    }


    render() {
        return (
            <div className="AssetRow row">
                <div className="row__assetCard2">
                    <AssetCard2
                        code={this.props.asset.getCode()}
                        issuer={this.props.asset.getIssuer()}
                        color={this.state.color}
                        currency={this.props.currency}
                        host={this.props.host} />
                </div>
                {this.getRowActionButton()}
            </div>
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
};
