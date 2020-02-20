import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../lib/Driver';
import AssetCardMain from '../../Common/AssetCard/AssetCardMain/AssetCardMain';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import Printify from '../../../lib/Printify';
import { niceNumDecimals } from '../../../lib/Format';


export default class TopVolumeAssets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stellarMarketsData: [],
            minUSDValue: 1,
        };
    }
    componentDidMount() {
        this.getStellarMarketsData();
    }

    getStellarMarketsData() {
        this.props.d.ticker.constructor.loadStellarMarketsData('XLM', 'native', 24)
            .then(res => this.setState({
                stellarMarketsData: res.data.markets,
            }));
    }

    getAssetList() {
        const { stellarMarketsData, minUSDValue } = this.state;
        const { d } = this.props;

        if (stellarMarketsData.length === 0 || !d.ticker.ready) {
            return (
                <div className="AssetList_asset AssetList_load">
                    <div className="AssetList_load-content">
                        Loading data from Stellar Ticker<Ellipsis />
                    </div>
                    {Array.from({ length: 5 }, (item, index) => <div key={index} />)}
                </div>
            );
        }

        const { USD_XLM, USD_XLM_change: changeXLM } = d.ticker.data._meta.externalPrices;

        const volumeXLM = stellarMarketsData.reduce((acc, item) => acc + item.baseVolume, 0);
        const topVolumeAssets = stellarMarketsData
            .sort((a, b) => (b.baseVolume - a.baseVolume))
            .filter(item => (item.baseVolume * USD_XLM > minUSDValue));

        const viewChangeXLM =
            changeXLM !== undefined && changeXLM !== null ? (
                <span className={`change${changeXLM < 0 ? 'Negative' : 'Positive'}`}>
                    {changeXLM.toFixed(2)}%
                </span>
            ) : '-';

        const sortedAssets = this.getSortedAssets(topVolumeAssets);
        const Xlm = d.ticker.data.assets.find(asset => asset.id === 'XLM-native');

        return (
            <React.Fragment>
                <Link
                    to={`/exchange/${Xlm.topTradePairSlug}`}
                    className="AssetList_asset">
                    <div className="asset_assetCard">
                        <AssetCardMain code={Xlm.code} issuer={Xlm.issuer} d={d} />
                    </div>
                    <div className="asset_cell price-xlm">
                        {Printify.lightenZeros('1.0000000')} {Printify.lighten(' XLM')}
                    </div>
                    <div className="asset_cell">
                        ${Printify.lightenZeros((USD_XLM).toString(), niceNumDecimals(USD_XLM))}
                    </div>
                    <div className="asset_cell">
                        ${(volumeXLM * USD_XLM).toLocaleString('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </div>
                    <div className="asset_cell">
                        {viewChangeXLM}
                    </div>
                    <div className="asset_cell" />
                </Link>
                {sortedAssets.map((item) => {
                    const changes = (((item.close / item.open) - 1) * 100).toFixed(2);
                    const changesClass = +changes >= 0 ? 'changePositive' : 'changeNegative';
                    return (
                        <Link
                            key={item.counterAssetCode + item.counterAssetIssuer}
                            to={`/exchange/${item.counterAssetCode}-${item.counterAssetIssuer}/XLM-native`}
                            className="AssetList_asset">

                            <div className="asset_assetCard">
                                <AssetCardMain
                                    d={d}
                                    code={item.counterAssetCode}
                                    issuer={item.counterAssetIssuer} />
                            </div>
                            <div className="asset_cell price-xlm">
                                {Printify.lightenZeros((item.close).toString(), niceNumDecimals(item.close))}
                                {Printify.lighten(' XLM')}
                            </div>
                            <div className="asset_cell">
                                ${Printify.lightenZeros((item.close * USD_XLM).toString(),
                                    niceNumDecimals(item.close * USD_XLM))}
                            </div>
                            <div className="asset_cell">
                                ${(item.baseVolume * USD_XLM).toLocaleString('en-US', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                })}
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
        const assetList = this.getAssetList();
        return <React.Fragment>{assetList}</React.Fragment>;
    }
}
TopVolumeAssets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    sortType: PropTypes.bool,
    sortBy: PropTypes.oneOf(['assetName', 'priceXLM', 'priceUSD', 'volume24h', 'change24h']),
};
