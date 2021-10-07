import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import { Link } from 'react-router-dom';
import AssetCardSeparateLogo from '../../../Common/AssetCard/AssetCardSeparateLogo/AssetCardSeparateLogo';
import Printify from '../../../../lib/Printify';
import { niceNumDecimals } from '../../../../lib/Format';
import Driver from '../../../../lib/Driver';
import PercentChange from '../../../Basics/PercentChange/PercentChange';

const SHOW_MORE_STEP_SIZE = 30;
const LS_TOP_PAIRS = 'top-pairs';

export default class TopVolumeAssetList extends React.Component {
    static getPairSlug({ baseAssetCode, baseAssetIssuer, counterAssetCode, counterAssetIssuer }) {
        return `${baseAssetCode}-${baseAssetIssuer || 'native'}:${counterAssetCode}-${counterAssetIssuer || 'native'}`;
    }
    static getRevertedPairSlug({ baseAssetCode, baseAssetIssuer, counterAssetCode, counterAssetIssuer }) {
        return `${counterAssetCode}-${counterAssetIssuer || 'native'}:${baseAssetCode}-${baseAssetIssuer || 'native'}`;
    }
    static download(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    constructor(props) {
        super(props);

        this.state = {
            minUSDValue: 0,
            showMoreStep: SHOW_MORE_STEP_SIZE,
            topPairs: JSON.parse(localStorage.getItem(LS_TOP_PAIRS) || '[]'),
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

    toggleTopPair(e, pair) {
        e.stopPropagation();
        e.preventDefault();

        if (this.isPairInTop(pair)) {
            const newTopPairs = this.state.topPairs.filter(pairSlug => (
                pairSlug !== TopVolumeAssetList.getPairSlug(pair) &&
                pairSlug !== TopVolumeAssetList.getRevertedPairSlug(pair)
            ));
            localStorage.setItem(LS_TOP_PAIRS, JSON.stringify(newTopPairs));
            this.setState({ topPairs: newTopPairs });
        } else {
            const newTopPairs = [...this.state.topPairs, TopVolumeAssetList.getPairSlug(pair)];
            localStorage.setItem(LS_TOP_PAIRS, JSON.stringify(newTopPairs));
            this.setState({ topPairs: newTopPairs });
        }
    }

    isPairInTop(pair) {
        const { topPairs } = this.state;

        return topPairs.includes(TopVolumeAssetList.getPairSlug(pair))
            || topPairs.includes(TopVolumeAssetList.getRevertedPairSlug(pair));
    }

    render() {
        const { minUSDValue, showMoreStep, topPairs } = this.state;
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
                    const inTop = this.isPairInTop(item);

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
                            <div className="TopVolume_cell right">
                                <svg
                                    viewBox="0 0 42 40"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`star ${inTop ? 'filled' : ''}`}
                                    onClick={e => this.toggleTopPair(e, item)}
                                >
                                    <path
                                        className="path"
                                        d="M20.7276 0.5906C20.8348 0.358138 21.1652 0.358138 21.2724 0.590599L27.1367 13.3043C27.1804 13.399 27.2702 13.4643 27.3738 13.4766L41.2774 15.125C41.5316 15.1552 41.6337 15.4694 41.4457 15.6432L31.1664 25.1492C31.0898 25.22 31.0555 25.3256 31.0759 25.4279L33.8045 39.1604C33.8544 39.4115 33.5871 39.6057 33.3637 39.4807L21.1465 32.642C21.0555 32.5911 20.9445 32.5911 20.8535 32.642L8.63626 39.4807C8.41288 39.6057 8.14559 39.4115 8.19548 39.1604L10.9241 25.4279C10.9445 25.3256 10.9102 25.22 10.8336 25.1492L0.554269 15.6432C0.36632 15.4694 0.468414 15.1552 0.722632 15.125L14.6262 13.4766C14.7298 13.4643 14.8196 13.399 14.8633 13.3043L20.7276 0.5906Z"
                                    />
                                </svg>
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
                {Boolean(topPairs.length) &&
                    <button
                        className="s-button"
                        onClick={() => {
                            TopVolumeAssetList.download('pairs', JSON.stringify(topPairs, null, 2));
                        }}
                    >
                        Export {topPairs.length} pairs
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
