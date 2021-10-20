import React from 'react';
import PropTypes from 'prop-types';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/Driver';
import images from '../../../images';
import NotFound from '../../NotFound/NotFound';
import TopVolumeAssetList from './TopVolumeAssetList/TopVolumeAssetList';


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
            loadingDataError: false,
        };
    }

    componentDidMount() {
        if (this.props.baseAsset) {
            this.getStellarMarketsData();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.baseAsset && (!prevProps.baseAsset
            || prevProps.baseAsset.code !== this.props.baseAsset.code
            || prevProps.baseAsset.issuer !== this.props.baseAsset.issuer)) {
            this.getStellarMarketsData();
            this.resetSort();
        }
    }

    async getStellarMarketsData() {
        if (this.currentRequestCanceller) {
            this.currentRequestCanceller();
        }
        this.setState({ loadingData: true, loadingDataError: false });
        const { code: assetCode, issuer: assetIssuer } = this.props.baseAsset;
        // Ticker doesn't revert pairs, we need to check asset as a base and as a counter

        try {
            const baseResponse = await this.loadStellarMarketsData({
                baseAssetCode: assetCode, baseAssetIssuer: assetIssuer || 'native', numHoursAgo: 24,
            });

            const counterResponse = await this.loadStellarMarketsData({
                counterAssetCode: assetCode, counterAssetIssuer: assetIssuer || 'native', numHoursAgo: 24,
            });

            const isBaseLumen = new StellarSdk.Asset(assetCode, assetIssuer).isNative();
            const lastLumenTrade = isBaseLumen
                ? null
                : await this.loadStellarMarketsData({
                    baseAssetCode: 'XLM',
                    baseAssetIssuer: 'native',
                    counterAssetCode: assetCode,
                    counterAssetIssuer: assetIssuer,
                    numHoursAgo: 168,
                });
            const lastLumenPrice = (lastLumenTrade && lastLumenTrade.data && lastLumenTrade.data.markets.length)
                ? lastLumenTrade.data.markets[0].close
                : 0;

            const revertedCounterResponse = counterResponse.data.markets.map(market => ({
                counterAssetCode: market.baseAssetCode,
                counterAssetIssuer: market.baseAssetIssuer === 'native' ? null : market.baseAssetIssuer,
                baseVolume: market.counterVolume,
                open: (1 / market.open).toFixed(7),
                close: (1 / market.close).toFixed(7),
            }));

            const combinedMarketsData = [...baseResponse.data.markets, ...revertedCounterResponse]
                .filter(({ counterAssetCode, counterAssetIssuer, baseAssetCode, baseAssetIssuer }) => (
                    !this.props.d.session.isDisabledAsset(counterAssetCode, counterAssetIssuer) &&
                    !this.props.d.session.isDisabledAsset(baseAssetCode, baseAssetIssuer)
                ));
            this.setState({
                stellarMarketsData: combinedMarketsData,
                lastLumenPrice,
                loadingData: false,
            });
        } catch (e) {
            if (e.name === 'AbortError') {
                console.log('Previous response was cancelled!');
                return;
            }
            this.setState({
                loadingData: false,
                loadingDataError: true,
            });
        }
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

        return headerCells.map(headerCell => {
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
                    key={headerCell.title}
                >

                    <span>{headerCell.title}</span>
                    {this.state.sortField !== headerCell.sortField ?
                        <img src={images['sort-arrow']} alt="sortBy" /> :
                        <img
                            src={images['sort-arrow-act']}
                            alt="sortBy"
                            className={this.state.sortDirection}
                        />
                    }
                </div>
            );
        });
    }

    loadStellarMarketsData(params) {
        const { request, cancel } =
            this.props.d.ticker.constructor.loadStellarMarketsData(
                Object.assign({}, params, { isTestnet: this.props.d.Server.isTestnet },
                ),
            );
        this.currentRequestCanceller = cancel;
        return request;
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

    render() {
        const { d, baseAsset } = this.props;
        const {
            stellarMarketsData, loadingData, lastLumenPrice, sortField, sortDirection, loadingDataError,
        } = this.state;

        if (!baseAsset) {
            return <NotFound withoutWrapper pageName="markets" />;
        }

        if (loadingDataError) {
            return (
                <div className="TopVolume">
                    <div className="TopVolume_empty error">
                        Error loading data from the ticker
                    </div>
                </div>
            );
        }

        const header = this.getTableHeader();

        return (
            <div className="TopVolume">
                <div className="TopVolume_header">
                    {header}
                </div>
                <TopVolumeAssetList
                    d={d}
                    baseAsset={baseAsset}
                    stellarMarketsData={stellarMarketsData}
                    loadingData={loadingData}
                    lastLumenPrice={lastLumenPrice}
                    sortField={sortField}
                    sortDirection={sortDirection}
                />
            </div>);
    }
}
TopVolumeAssets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    baseAsset: PropTypes.instanceOf(StellarSdk.Asset),
};
