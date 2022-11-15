import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { Link } from 'react-router-dom';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import Printify from '../../../../lib/helpers/Printify';
import { niceNumDecimals } from '../../../../lib/helpers/Format';
import Driver from '../../../../lib/driver/Driver';
import PercentChange from '../../../Basics/PercentChange/PercentChange';

const SHOW_MORE_STEP_SIZE = 30;

export default class TopVolumeAssetList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            minUSDValue: 0,
            showMoreStep: SHOW_MORE_STEP_SIZE,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.sortField !== this.props.sortField
            || prevProps.sortDirection !== this.props.sortDirection
            || prevProps.baseAsset !== this.props.baseAsset
        ) {
            this.resetShowMoreStep();
        }
    }

    getSortedAssets(assets) {
        const { sortField } = this.props;
        switch (sortField) {
            case 'assetName':
                return this.sortByField(assets, 'counterAssetCode', 'string');
            case 'priceXLM':
                return this.sortByField(assets, 'close', 'number');
            case 'priceUSD':
                return this.sortByField(assets, 'close', 'number');
            case 'volume24h':
                return this.sortByField(assets, 'baseVolume', 'number');
            case 'change24h':
                return this.sortByPercent(assets);
            default:
                return assets;
        }
    }

    sortByField(array, sortField, sortValueType) {
        const { sortDirection } = this.props;
        if (sortValueType === 'string') {
            return array.sort((a, b) => (sortDirection !== 'up' ?
                (a[sortField].localeCompare(b[sortField])) :
                (b[sortField].localeCompare(a[sortField]))));
        }
        if (sortValueType === 'number') {
            return array.sort((a, b) => (sortDirection !== 'up'
                ? (a[sortField] - b[sortField])
                : (b[sortField] - a[sortField])));
        }

        throw new Error('Unknown sort value type');
    }

    sortByPercent(array) {
        const { sortDirection } = this.props;
        return array.sort((a, b) => (sortDirection !== 'up' ?
            (((a.close / a.open) - 1) - ((b.close / b.open) - 1)) :
            (((b.close / b.open) - 1) - ((a.close / a.open) - 1))));
    }

    increaseShowMoreStep() {
        const { showMoreStep } = this.state;
        this.setState({
            showMoreStep: showMoreStep + SHOW_MORE_STEP_SIZE,
        });
    }

    resetShowMoreStep() {
        this.setState({
            showMoreStep: SHOW_MORE_STEP_SIZE,
        });
    }

    render() {
        const { minUSDValue, showMoreStep } = this.state;
        const { d, stellarMarketsData, loadingData, lastLumenPrice, baseAsset } = this.props;
        const { code: assetCode, issuer: assetIssuer } = baseAsset;

        if (loadingData || !d.ticker.ready) {
            return (
                <div className="TopVolume_loader">
                    <div className="nk-spinner" />
                </div>
            );
        }

        if (stellarMarketsData.length === 0) {
            return (
                <div className="TopVolume_empty">
                    This base asset has not been traded in the last 24 hours
                </div>
            );
        }

        const { USD_XLM } = d.ticker.data._meta.externalPrices;

        const priceUSD = new StellarSdk.Asset(assetCode, assetIssuer).isNative() ?
            USD_XLM : USD_XLM * lastLumenPrice;


        const topVolumeAssets = stellarMarketsData
            .filter(item => (item.baseVolume * priceUSD > minUSDValue));

        const sortedAssets = this.getSortedAssets(topVolumeAssets);

        const trimmedAssets = sortedAssets.slice(0, showMoreStep);

        return (
            <React.Fragment>
                {trimmedAssets.map(item => {
                    const changes = (((item.close / item.open) - 1) * 100).toFixed(2);

                    return (
                        <Link
                            key={item.counterAssetCode + item.counterAssetIssuer}
                            to={`/exchange/${item.counterAssetCode}-${item.counterAssetIssuer || 'native'}/${assetCode}-${assetIssuer || 'native'}`}
                            className="TopVolume_row"
                        >

                            <div className="TopVolume_cell">
                                <AssetCardSeparateLogo
                                    noIssuer
                                    logoSize={30}
                                    d={d}
                                    code={item.counterAssetCode}
                                    issuer={item.counterAssetIssuer}
                                />
                            </div>
                            <div className="TopVolume_cell">
                                <AssetCardSeparateLogo
                                    noIssuer
                                    logoSize={30}
                                    d={d}
                                    code={assetCode}
                                    issuer={assetIssuer}
                                />
                            </div>
                            <div className="TopVolume_cell">
                                <div className="TopVolume_cell-column">
                                    <span className="TopVolume_cell-value">
                                        {Printify.lightenZeros(
                                            (item.close).toString(),
                                            niceNumDecimals(item.close),
                                            ` ${assetCode}`,
                                        )}
                                    </span>
                                    <span className="TopVolume_cell-value-usd">
                                        {priceUSD !== 0 && '$'}
                                        {priceUSD !== 0 ?
                                            Printify.lightenZeros((item.close * priceUSD).toString(),
                                                niceNumDecimals(item.close * priceUSD)) : '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="TopVolume_cell">
                                <div className="TopVolume_cell-column">
                                    <span className="TopVolume_cell-value">
                                        {Printify.lightenZeros(
                                            (item.baseVolume).toString(),
                                            niceNumDecimals(item.baseVolume),
                                            ` ${assetCode}`,
                                        )}
                                    </span>
                                    <span className="TopVolume_cell-value-usd">
                                        {priceUSD !== 0 ?
                                            `$${(item.baseVolume * priceUSD).toLocaleString('en-US', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            })}` : '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="TopVolume_cell right">
                                <PercentChange changePercent={changes} />
                            </div>
                        </Link>);
                })}
                {showMoreStep < sortedAssets.length &&
                    <button
                        className="s-button"
                        onClick={() => this.increaseShowMoreStep(sortedAssets.length)}
                    >
                        Show more
                    </button>
                }
            </React.Fragment>
        );
    }
}
TopVolumeAssetList.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    baseAsset: PropTypes.instanceOf(StellarSdk.Asset).isRequired,
    stellarMarketsData: PropTypes.arrayOf(PropTypes.any).isRequired,
    loadingData: PropTypes.bool.isRequired,
    lastLumenPrice: PropTypes.number,
    sortField: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
};
