import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/Driver';
import AssetCardMain from '../../Common/AssetCard/AssetCardMain/AssetCardMain';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import Printify from '../../../lib/Printify';
import { niceNumDecimals } from '../../../lib/Format';
import AssetDropDown from '../../Common/AssetPair/AssetDropDown/AssetDropDown';


export default class TopVolumeAssets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stellarMarketsData: [],
            minUSDValue: 0,
            loadingData: false,
            assetCode: 'XLM',
            assetIssuer: null,
        };
    }

    componentDidMount() {
        this.getStellarMarketsData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.assetCode !== this.state.assetCode
            || prevState.assetIssuer !== this.state.assetIssuer) {
            this.getStellarMarketsData();
        }
    }

    async getStellarMarketsData() {
        this.setState({ loadingData: true });
        const { assetCode, assetIssuer } = this.state;
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
        const { stellarMarketsData, minUSDValue, loadingData, assetCode, assetIssuer, lastLumenPrice } = this.state;
        const { d } = this.props;

        if (loadingData || !d.ticker.ready) {
            return (
                <div className="AssetList_asset AssetList_load">
                    <div className="AssetList_load-content">
                        Loading data from Stellar Ticker<Ellipsis />
                    </div>
                    {Array.from({ length: 5 }, (item, index) => <div key={index} />)}
                </div>
            );
        }

        if (stellarMarketsData.length === 0) {
            return (
                <div className="AssetList_asset AssetList_load">
                    <div className="AssetList_load-content">
                        Market 24h trades are empty
                    </div>
                    {Array.from({ length: 5 }, (item, index) => <div key={index} />)}
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
                            className="AssetList_asset">

                            <div className="asset_assetCard">
                                <AssetCardMain
                                    d={d}
                                    code={item.counterAssetCode}
                                    issuer={item.counterAssetIssuer} />
                            </div>
                            <div className="asset_cell price-xlm">
                                {Printify.lightenZeros((item.close).toString(), niceNumDecimals(item.close))}
                                {Printify.lighten(` ${assetCode}`)}
                            </div>
                            <div className="asset_cell">
                                {priceUSD !== 0 && '$'}
                                {priceUSD !== 0 ?
                                    Printify.lightenZeros((item.close * priceUSD).toString(),
                                        niceNumDecimals(item.close * priceUSD)) : '-'}
                            </div>
                            <div className="asset_cell">
                                {priceUSD !== 0 ?
                                    `$${(item.baseVolume * priceUSD).toLocaleString('en-US', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    })}` : '-'}
                            </div>
                            <div className="asset_cell">
                                <span className={changes !== '0.00' ? changesClass : ''}>
                                    {changes} %
                                </span>
                            </div>
                            <div className="asset_cell">
                                <span className="tradeLink">trade</span>
                            </div>

                        </Link>);
                })}
            </React.Fragment>
        );
    }

    getSortedAssets(assets) {
        const { sortBy } = this.props;
        switch (sortBy) {
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
        const { sortType } = this.props;
        if (sortValueType === 'string') {
            return array.sort((a, b) => (sortType ?
                (a[sortField].localeCompare(b[sortField])) :
                (b[sortField].localeCompare(a[sortField]))));
        }
        if (sortValueType === 'number') {
            return array.sort((a, b) => (sortType ? (a[sortField] - b[sortField]) : (b[sortField] - a[sortField])));
        }

        throw new Error('Unknown sort value type');
    }

    sortByPercent(array) {
        const { sortType } = this.props;
        return array.sort((a, b) => (sortType ?
            (((a.close / a.open) - 1) - ((b.close / b.open) - 1)) :
            (((b.close / b.open) - 1) - ((a.close / a.open) - 1))));
    }

    render() {
        const { stellarMarketsData, assetCode, assetIssuer, lastLumenPrice } = this.state;
        const { d } = this.props;
        const { USD_XLM, USD_XLM_change: changeXLM } = d.ticker.data._meta.externalPrices;
        const isBaseLumen = new StellarSdk.Asset(assetCode, assetIssuer).isNative();
        const priceUSD = isBaseLumen ?
            USD_XLM : USD_XLM * lastLumenPrice;
        const volume = stellarMarketsData.reduce((acc, item) => acc + item.baseVolume, 0);
        const viewChangeXLM =
            (changeXLM !== undefined && changeXLM !== null && isBaseLumen) ? (
                <span className={`change${changeXLM < 0 ? 'Negative' : 'Positive'}`}>
                    {changeXLM.toFixed(2)}%
                </span>
            ) : '-';

        const assetList = this.getAssetList();
        return (
            <React.Fragment>
                <div
                    className="AssetList_asset AssetList_head-asset">
                    <div className="asset_assetCard">
                        <AssetDropDown
                            d={d}
                            asset={assetCode && new StellarSdk.Asset(assetCode, assetIssuer)}
                            onUpdate={asset => this.setState({
                                assetCode: asset.code,
                                assetIssuer: asset.issuer,
                            })} />
                    </div>
                    <div className="asset_cell price-xlm">
                        {Printify.lightenZeros('1.0000000')} {Printify.lighten(` ${assetCode}`)}
                    </div>
                    <div className="asset_cell">
                        ${Printify.lightenZeros((priceUSD).toString(), niceNumDecimals(priceUSD))}
                    </div>
                    <div className="asset_cell">
                        ${(volume * priceUSD).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </div>
                    <div className="asset_cell">
                        {viewChangeXLM}
                    </div>
                    <div className="asset_cell" />
                </div>
                {assetList}
            </React.Fragment>);
    }
}
TopVolumeAssets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    sortType: PropTypes.bool,
    sortBy: PropTypes.oneOf(['assetName', 'priceXLM', 'priceUSD', 'volume24h', 'change24h']),
};
