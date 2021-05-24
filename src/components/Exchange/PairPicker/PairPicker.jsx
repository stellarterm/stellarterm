import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from 'stellar-sdk';
import Driver from '../../../lib/Driver';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import AssetPair from '../../Common/AssetPair/AssetPair';
import MagicSpoon from '../../../lib/MagicSpoon';
import { getReadableNumber } from '../LightweightChart/ConverterOHLC';
import { niceRound } from '../../../lib/Format';

export default class PairPicker extends React.Component {
    static get24ChangesPercent(state) {
        const { last24HourTrades, lastMinutesTrade } = state;
        if (!last24HourTrades || !lastMinutesTrade || !last24HourTrades.length) {
            return null;
        }
        const startPeriodIndex = last24HourTrades.length - 1;
        const startPrice = parseFloat(last24HourTrades[startPeriodIndex].open);
        const finishPrice = parseFloat(lastMinutesTrade.records[0].close);
        return (((finishPrice / startPrice) - 1) * 100).toFixed(2);
    }

    constructor(props) {
        super(props);
        this.state = {
            last24HourTrades: undefined,
            lastMinutesTrade: undefined,
            counterWithLumenLastTrade: undefined,
            lastChangesDirection: '',
        };
        this.unsub = this.props.d.ticker.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentDidMount() {
        this._mounted = true;
        this.getLastTrades();
    }

    componentDidUpdate(prevProps, prevState) {
        const nextChanges = parseFloat(this.constructor.get24ChangesPercent(this.state));
        const prevChanges = parseFloat(this.constructor.get24ChangesPercent(prevState));
        const firstLoad = prevChanges === null;
        if (!firstLoad && prevChanges < nextChanges) {
            this.setChangesDirection('up');
        }
        if (!firstLoad && prevChanges > nextChanges) {
            this.setChangesDirection('down');
        }
    }

    componentWillUnmount() {
        this._mounted = false;
        this.unsub();
        clearTimeout(this.updateDataTimeout);
    }

    setChangesDirection(lastChangesDirection) {
        if (this._mounted) {
            this.setState({ lastChangesDirection });
            setTimeout(() => this.setState({ lastChangesDirection: '' }), 1000);
        }
    }

    getPairMarketsData() {
        const { d } = this.props;
        const { baseBuying } = d.orderbook.data;
        const { last24HourTrades, lastMinutesTrade, counterWithLumenLastTrade } = this.state;

        if (!last24HourTrades || !lastMinutesTrade || !counterWithLumenLastTrade || !d.ticker.ready) {
            return {
                status: 'load',
            };
        }

        if (last24HourTrades.length === 0) {
            return {
                status: 'no_trades',
            };
        }
        const lastPrice = parseFloat(lastMinutesTrade.records[0].close);
        const changes24 = this.constructor.get24ChangesPercent(this.state);

        const { volume24, price24high, price24low } = last24HourTrades
            .reduce((acc, record) => {
                acc.volume24 += parseFloat(record.counter_volume);
                acc.price24high = (!acc.price24high || acc.price24high < parseFloat(record.high)) ?
                    parseFloat(record.high) : acc.price24high;
                acc.price24low = (!acc.price24low || acc.price24low > parseFloat(record.low)) ?
                    parseFloat(record.low) : acc.price24low;
                return acc;
            }, { volume24: 0, price24high: 0, price24low: 0 });

        const counterWithLumenLastTradeOpen =
            (counterWithLumenLastTrade !== 'notRequired' && counterWithLumenLastTrade.records.length) ?
                counterWithLumenLastTrade.records[0].close : 0;

        const convertedLastPriceToXLM = counterWithLumenLastTrade === 'notRequired' ?
            lastPrice :
            lastPrice * counterWithLumenLastTradeOpen;

        const { USD_XLM } = d.ticker.data._meta.externalPrices;
        const lastUsdPrice = baseBuying.isNative() ? USD_XLM : USD_XLM * convertedLastPriceToXLM;

        return {
            status: 'trades_fully',
            lastPrice,
            lastUsdPrice,
            changes24,
            volume24,
            price24low,
            price24high,
        };
    }

    async getLastTrades() {
        const { d } = this.props;
        const { baseBuying, counterSelling } = d.orderbook.data;
        const pairWithoutLumen = !baseBuying.isNative() && !counterSelling.isNative();

        const lastTradesWithStep15min =
            await d.orderbook.handlers.getLast24hAggregationsWithStep15min();

        const lastMinutesTrade = await d.orderbook.handlers.getLastMinuteAggregation();

        const counterWithLumenLastTrade = pairWithoutLumen ?
            await MagicSpoon.getLastMinuteAggregation(d.Server, counterSelling, StellarSdk.Asset.native()) :
            'notRequired';


        if (!this._mounted) {
            return;
        }

        if (!lastTradesWithStep15min) {
            this.setState({
                last24HourTrades: [],
                lastMinutesTrade: {},
                counterWithLumenLastTrade: {},
            });
            return;
        }
        const last24HourTrades = lastTradesWithStep15min.records;

        this.setState({
            last24HourTrades,
            lastMinutesTrade,
            counterWithLumenLastTrade,
        });

        // Update every 15 seconds
        this.updateDataTimeout = setTimeout(() => this.getLastTrades(), 15000);
    }

    getPairMarketsTableContent() {
        const { d } = this.props;
        const { counterSelling } = d.orderbook.data;
        const counterAssetCode = counterSelling.getCode();
        const { status, lastPrice, lastUsdPrice, changes24, volume24, price24low, price24high } =
            this.getPairMarketsData();

        if (status === 'load') {
            return (
                <div className="PairPicker_marketsTable-content">
                    {Array.from({ length: 6 }, (item, index) => <span key={index}><Ellipsis /></span>)}
                </div>
            );
        }

        if (status === 'no_trades') {
            return (
                <div className="PairPicker_marketsTable-content">
                    {Array.from({ length: 6 }, (item, index) => <span key={index}>—</span>)}
                </div>
            );
        }

        const noChanges = changes24 === '0.00';
        const changesClassName = (changes24 >= 0) ? 'positive' : 'negative';
        const lastUsdView = lastUsdPrice !== 0 ? `$${niceRound(lastUsdPrice)}` : '—';

        return (
            <div className="PairPicker_marketsTable-content">
                <span>{getReadableNumber(lastPrice)} {counterAssetCode}</span>
                <span>{lastUsdView}</span>
                <span className={noChanges ? '' : changesClassName}>
                    <span className={this.state.lastChangesDirection}>{changes24 > 0 && '+'}{changes24}%</span>
                </span>
                <span>{getReadableNumber(price24high)} {counterAssetCode}</span>
                <span>{getReadableNumber(price24low)} {counterAssetCode}</span>
                <span>{getReadableNumber(volume24)} {counterAssetCode}</span>
            </div>
        );
    }

    render() {
        const { d } = this.props;
        const { ready, baseBuying, counterSelling } = d.orderbook.data;

        if (!ready) {
            return (<div>Loading<Ellipsis /></div>);
        }

        const marketsTableContent = this.getPairMarketsTableContent();

        return (
            <div className="island">
                <div className="PairPicker_assetPair">
                    <AssetPair baseBuying={baseBuying} counterSelling={counterSelling} d={d} swap dropdown />
                </div>
                <div className="PairPicker_marketsTable">
                    <div className="PairPicker_marketsTable-header">
                        <span>Last Price</span>
                        <span>Last USD Price</span>
                        <span>24h Changes </span>
                        <span>24h High</span>
                        <span>24h Low</span>
                        <span>24h Volume</span>
                    </div>
                    {marketsTableContent}
                </div>

                <Link to="/markets/" className="PairPicker_seeOthers">
                    <span>See other trading pairs</span>
                </Link>
            </div>
        );
    }
}

PairPicker.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
