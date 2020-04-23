import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/Driver';
import Printify from '../../../lib/Printify';
import { niceNumDecimals } from '../../../lib/Format';
import AssetCardInRow from '../../Common/AssetCard/AssetCardInRow/AssetCardInRow';
import images from '../../../images';


export default class TopVolumeAssets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stellarMarketsData: [],
            minUSDValue: 0,
            loadingData: false,
            assetCode: 'XLM',
            assetIssuer: null,
            sortDirection: 'up',
            sortField: 'volume24h',
        };
    }

    componentDidMount() {
        this.getStellarMarketsData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.baseAsset.code !== this.props.baseAsset.code
            || prevProps.baseAsset.issuer !== this.props.baseAsset.issuer) {
            this.getStellarMarketsData();
            this.resetSort();
        }
    }

    async getStellarMarketsData() {
        this.setState({ loadingData: true });
        const { code: assetCode, issuer: assetIssuer } = this.props.baseAsset;
        // Ticker doesn't revert pairs, we need to check asset as a base and as a counter
        const baseResponse = await this.props.d.ticker.constructor.loadStellarMarketsData({
            baseAssetCode: assetCode, baseAssetIssuer: assetIssuer || 'native', numHoursAgo: 24,
        });
        const counterResponse = await this.props.d.ticker.constructor.loadStellarMarketsData({
            counterAssetCode: assetCode, counterAssetIssuer: assetIssuer || 'native', numHoursAgo: 24,
        });

        const revertedCounterResponse = counterResponse.data.markets.map(market => ({
            counterAssetCode: market.baseAssetCode,
            counterAssetIssuer: market.baseAssetIssuer === 'native' ? null : market.baseAssetIssuer,
            baseVolume: market.counterVolume,
            open: (1 / market.open).toFixed(7),
            close: (1 / market.close).toFixed(7),
        }));
        const isBaseLumen = new StellarSdk.Asset(assetCode, assetIssuer).isNative();
        const lastLumenTrade = !isBaseLumen &&
            await this.props.d.ticker.constructor.loadStellarMarketsData({
                baseAssetCode: 'XLM',
                baseAssetIssuer: 'native',
                counterAssetCode: assetCode,
                counterAssetIssuer: assetIssuer,
                numHoursAgo: 168,
            });

        const lastLumenPrice = (!isBaseLumen && lastLumenTrade.data.markets.length)
            ? lastLumenTrade.data.markets[0].close
            : 0;


        const combinedMarketsData = [...baseResponse.data.markets, ...revertedCounterResponse];
        this.setState({
            stellarMarketsData: combinedMarketsData,
            lastLumenPrice,
            loadingData: false,
        });
    }

    getAssetList() {
        const { stellarMarketsData, minUSDValue, loadingData, lastLumenPrice } = this.state;
        const { code: assetCode, issuer: assetIssuer } = this.props.baseAsset;
        const { d } = this.props;

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

        return (
            <React.Fragment>
                {sortedAssets.map((item) => {
                    const changes = (((item.close / item.open) - 1) * 100).toFixed(2);
                    const changesClass = +changes >= 0 ? 'changePositive' : 'changeNegative';
                    return (
                        <Link
                            key={item.counterAssetCode + item.counterAssetIssuer}
                            to={`/exchange/${item.counterAssetCode}-${item.counterAssetIssuer || 'native'}/${assetCode}-${assetIssuer || 'native'}`}
                            className="TopVolume_row">

                            <div className="TopVolume_cell">
                                <AssetCardInRow
                                    d={d}
                                    code={item.counterAssetCode}
                                    issuer={item.counterAssetIssuer} />
                            </div>
                            <div className="TopVolume_cell">
                                <AssetCardInRow d={d} code={assetCode} issuer={assetIssuer} />
                            </div>
                            <div className="TopVolume_cell">
                                {Printify.lightenZeros(
                                    (item.close).toString(),
                                    niceNumDecimals(item.close),
                                    ` ${assetCode}`,
                                )}
                                <sup>
                                    {priceUSD !== 0 && '$'}
                                    {priceUSD !== 0 ?
                                        Printify.lightenZeros((item.close * priceUSD).toString(),
                                            niceNumDecimals(item.close * priceUSD)) : '-'}
                                </sup>
                            </div>
                            <div className="TopVolume_cell">
                                {Printify.lightenZeros(
                                    (item.baseVolume).toString(),
                                    niceNumDecimals(item.baseVolume),
                                    ` ${assetCode}`,
                                )}
                                <sup>
                                    {priceUSD !== 0 ?
                                        `$${(item.baseVolume * priceUSD).toLocaleString('en-US', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        })}` : '-'}
                                </sup>
                            </div>
                            <div className="TopVolume_cell right">
                                <span className={changes !== '0.00' ? changesClass : ''}>
                                    {changes} %
                                    {changes !== '0.00' &&
                                        <img
                                            className="changeArrow"
                                            src={images[changes > 0 ? 'icon-trade-up' : 'icon-trade-down']} alt="" />
                                    }
                                </span>
                            </div>
                        </Link>);
                })}
            </React.Fragment>
        );
    }

    getTableHeader() {
        const { loadingData, stellarMarketsData } = this.state;
        const { d } = this.props;

        if (loadingData || !d.ticker.ready || stellarMarketsData.length === 0) {
            return null;
        }

        const headerCells = [
            { title: 'Counter asset', sortField: 'assetName' },
            { title: 'Base asset', sortField: 'withoutSort' },
            { title: 'Price', sortField: 'priceXLM' },
            { title: 'Volume (24h)', sortField: 'volume24h' },
            { title: 'Change (24h)', sortField: 'change24h', align: 'right' },
        ];

        return headerCells.map((headerCell) => {
            if (headerCell.sortField === 'withoutSort') {
                return (
                    <div className={`TopVolume_cell withoutSort ${headerCell.align}`} key={headerCell.title}>
                        <span>{headerCell.title}</span>
                    </div>
                );
            }

            return (
                <div
                    className={`TopVolume_cell ${headerCell.align}`}
                    onClick={() => this.handleSort(headerCell.sortField)}
                    key={headerCell.title}>

                    <span>{headerCell.title}</span>
                    {this.state.sortField !== headerCell.sortField ?
                        <img src={images['sort-arrow']} alt="sortBy" /> :
                        <img
                            src={images['sort-arrow-act']}
                            alt="sortBy"
                            className={this.state.sortDirection} />
                    }
                </div>
            );
        });
    }

    getSortedAssets(assets) {
        const { sortField } = this.state;
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

    resetSort() {
        this.setState({
            sortDirection: 'up',
            sortField: 'volume24h',
        });
    }

    handleSort(sortField) {
        if (sortField !== this.state.sortField) {
            this.setState({
                sortField,
                sortDirection: 'up',
            });
            return;
        }
        this.setState({
            sortDirection: this.state.sortDirection === 'up' ? 'down' : 'up',
        });
    }

    sortByField(array, sortField, sortValueType) {
        const { sortDirection } = this.state;
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
        const { sortDirection } = this.state;
        return array.sort((a, b) => (sortDirection !== 'up' ?
            (((a.close / a.open) - 1) - ((b.close / b.open) - 1)) :
            (((b.close / b.open) - 1) - ((a.close / a.open) - 1))));
    }

    render() {
        const header = this.getTableHeader();
        const assetList = this.getAssetList();
        return (
            <div className="TopVolume">
                <div className="TopVolume_header">
                    {header}
                </div>
                {assetList}
            </div>);
    }
}
TopVolumeAssets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    baseAsset: PropTypes.instanceOf(StellarSdk.Asset),
};
