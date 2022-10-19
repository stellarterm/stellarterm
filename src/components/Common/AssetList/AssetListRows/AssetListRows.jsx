import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import directory from 'stellarterm-directory';
import { niceNumDecimals, get24hChangePercent } from '../../../../lib/helpers/Format';
import Printify from '../../../../lib/helpers/Printify';
import Ticker from '../../../../lib/api/Ticker';
import PercentChange from '../../../Basics/PercentChange/PercentChange';
import AssetCardMain from '../../AssetCard/AssetCardMain/AssetCardMain';
import Driver from '../../../../lib/driver/Driver';

export default class AssetListRows extends React.Component {
    static getAssetRow(asset, ticker) {
        const isNativeXlm = asset.id === 'XLM-native';
        const priceUSD = asset.price_USD ? (
            <span>${Printify.lightenZeros(asset.price_USD.toString(), niceNumDecimals(asset.price_USD))}</span>
        ) : (
            '-'
        );

        const priceXLM = asset.price_XLM
            ? Printify.lightenZeros(asset.price_XLM.toString(), niceNumDecimals(asset.price_XLM))
            : '-';

        const volume24h = asset.volume24h_USD
            ? `$${asset.volume24h_USD.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })}`
            : '$0';

        const change24h = (
            <PercentChange changePercent={get24hChangePercent(asset, ticker)} />
        );

        const tradeLink = asset.topTradePairSlug ? <span className="tradeLink">trade</span> : null;

        return (
            <React.Fragment>
                <div className="asset_cell price-xlm">
                    {isNativeXlm ? Printify.lightenZeros('1.0000000') : priceXLM}
                    {Printify.lighten(' XLM')}
                </div>
                <div className="asset_cell">{priceUSD}</div>
                <div className="asset_cell">{volume24h}</div>
                <div className="asset_cell">{change24h}</div>
                <div className="asset_cell">{tradeLink}</div>
            </React.Fragment>
        );
    }

    constructor(props) {
        super(props);

        const { ticker, d } = this.props;

        const assets = ticker.data.assets
            .map(asset => {
                const directoryAsset = directory.getAssetByAccountId(asset.code, asset.issuer);

                const assetIsUndefined =
                    directoryAsset === null ||
                    directoryAsset.unlisted ||
                    directoryAsset.disabled;

                const isAssetHidden = assetIsUndefined || asset.id === 'XLM-native';
                return isAssetHidden
                    ? null
                    : {
                        assetName: asset.code,
                        priceXLM: asset.price_XLM,
                        priceUSD: asset.price_USD,
                        volume24h: asset.volume24h_USD,
                        change24h: asset.change24h_USD,
                        assetRow: (
                            <Link
                                to={`/exchange/${asset.topTradePairSlug}`}
                                key={`asset-${asset.id}-${asset.code}`}
                                className="AssetList_asset"
                            >
                                <div className="asset_assetCard">
                                    <AssetCardMain code={asset.code} issuer={asset.issuer} d={d} />
                                </div>
                                {this.constructor.getAssetRow(asset, ticker)}
                            </Link>
                        ),
                    };
            })
            .filter(asset => asset !== null);

        this.state = {
            assets,
        };
    }

    sortAssets(allAssets) {
        allAssets.forEach(item => {
            if (!item.change24h) {
                // eslint-disable-next-line no-param-reassign
                item.change24h = 0;
            }
        });

        const { sortBy, sortType, limit, showLowTradable } = this.props;
        const ascDescType = new Map([
            [true, 'asc'],
            [false, 'desc'],
        ]);
        const isAscSort = sortType !== null ? ascDescType.get(sortType) : '';
        const halfInfoAssets = [];
        const lowTradableAssets = [];

        const fullInfoAssets = allAssets.filter(asset => {
            const isFullUndefined = !asset.priceXLM && !asset.priceUSD && !asset.change24h && !asset.volume24h;

            if (asset[sortBy] === undefined || asset[sortBy] === null || isFullUndefined) {
                halfInfoAssets.push(asset);
                return null;
            } else if (asset.volume24h < 1) {
                lowTradableAssets.push(asset);
                return null;
            }
            return asset;
        });

        const fullInfoSortedAssets = limit
            ? _.orderBy(fullInfoAssets, 'volume24h', 'desc').slice(0, limit - 1)
            : _.orderBy(fullInfoAssets, sortBy, isAscSort);

        const allAvailableAssets = _.orderBy(fullInfoSortedAssets.concat(lowTradableAssets), sortBy, isAscSort);

        const allAvailableSortedAssets = showLowTradable
            ? allAvailableAssets.concat(halfInfoAssets)
            : fullInfoSortedAssets;

        return limit ? _.orderBy(fullInfoSortedAssets, sortBy, isAscSort) : allAvailableSortedAssets;
    }

    render() {
        const { d, ticker } = this.props;
        const xlmAsset = d.ticker.data.assets.find(asset => asset.id === 'XLM-native');

        return (
            <React.Fragment>
                <Link to={`/exchange/${xlmAsset.topTradePairSlug}`} className="AssetList_asset">
                    <div className="asset_assetCard">
                        <AssetCardMain code={xlmAsset.code} issuer={xlmAsset.issuer} d={d} />
                    </div>
                    {this.constructor.getAssetRow(xlmAsset, ticker)}
                </Link>
                {this.sortAssets(this.state.assets).map(asset => asset.assetRow)}
            </React.Fragment>
        );
    }
}

AssetListRows.propTypes = {
    ticker: PropTypes.instanceOf(Ticker).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    limit: PropTypes.number,
    sortBy: PropTypes.string,
    sortType: PropTypes.bool,
    showLowTradable: PropTypes.bool,
};
