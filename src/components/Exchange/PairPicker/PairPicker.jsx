import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as StellarSdk from '@stellar/stellar-sdk';
import Debounce from 'awesome-debounce-promise';
import Driver from '../../../lib/driver/Driver';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import AssetPair from '../../Common/AssetPair/AssetPair';
import MagicSpoon from '../../../lib/helpers/MagicSpoon';
import { roundAndFormat, roundAndFormatPrice } from '../../../lib/helpers/Format';
import images from '../../../images';
import { TRADES_EVENTS } from '../../../lib/driver/driverInstances/Trades';

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
            lastTradesPending: false,
        };
        this.unsub = this.props.d.ticker.event.sub(() => {
            this.forceUpdate();
        });

        this.debouncedGetLastTrades = Debounce(this.getLastTrades.bind(this), 700);

        this.unsubTrades = this.props.d.trades.event.sub(event => {
            if (event.type === TRADES_EVENTS.STREAM_UPDATE) {
                this.debouncedGetLastTrades();
            }
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
        this.unsubTrades();
    }

    setChangesDirection(lastChangesDirection) {
        if (this._mounted) {
            this.setState({ lastChangesDirection });
            setTimeout(() => this.setState({ lastChangesDirection: '' }), 1000);
        }
    }

    getPairMarketsData() {
        const { d } = this.props;
        const { base } = d.trades;
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
        const lastUsdPrice = base.isNative() ? USD_XLM : USD_XLM * convertedLastPriceToXLM;

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
        if (this.state.lastTradesPending) {
            return;
        }
        this.setState({ lastTradesPending: true });

        const { d } = this.props;
        const { base, counter } = d.trades;

        const pairWithoutLumen = !base.isNative() && !counter.isNative();

        const lastTradesWithStep15min = await d.trades.getLast24hAggregationsWithStep15min();
        const lastMinutesTrade = await d.trades.getLastMinuteAggregation();
        const counterWithLumenLastTrade = pairWithoutLumen ?
            await MagicSpoon.getLastMinuteAggregation(d.Server, counter, StellarSdk.Asset.native()) :
            'notRequired';

        if (!this._mounted) {
            return;
        }

        if (!lastTradesWithStep15min) {
            this.setState({
                last24HourTrades: [],
                lastMinutesTrade: {},
                counterWithLumenLastTrade: {},
                lastTradesPending: false,
            });
            return;
        }
        const last24HourTrades = lastTradesWithStep15min.records;

        this.setState({
            last24HourTrades,
            lastMinutesTrade,
            counterWithLumenLastTrade,
            lastTradesPending: false,
        });
    }

    getPairMarketsTableContent() {
        const { counter } = this.props.d.trades;
        const counterAssetCode = counter.getCode();
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
        const isNaNChanges = changes24 === 'NaN';
        const changesClassName = (changes24 >= 0) ? 'positive' : 'negative';
        const lastUsdView = lastUsdPrice !== 0 ? `$${roundAndFormat(lastUsdPrice, true, 1e3)}` : '—';
        const changes24View = isNaNChanges ? '—' : `${changes24}%`;

        return (
            <div className="PairPicker_marketsTable-content">
                <span>{roundAndFormatPrice(lastPrice, 1e3)} {counterAssetCode}</span>
                <span>{lastUsdView}</span>
                <span className={(noChanges || isNaNChanges) ? '' : changesClassName}>
                    <span className={this.state.lastChangesDirection}>{changes24 > 0 && '+'}{changes24View}</span>
                </span>
                <span>{roundAndFormatPrice(price24high, 1e3)} {counterAssetCode}</span>
                <span>{roundAndFormatPrice(price24low, 1e3)} {counterAssetCode}</span>
                <span>{roundAndFormat(volume24, true, 1e3)} {counterAssetCode}</span>
            </div>
        );
    }

    render() {
        const { d } = this.props;
        const { base, counter } = d.trades;

        const marketsTableContent = this.getPairMarketsTableContent();

        return (
            <div className="island">
                <div className="PairPicker_assetPair">
                    <AssetPair baseBuying={base} counterSelling={counter} d={d} swap dropdown />
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

                <Link to="/markets/" className="AssetListFooterAsLink">
                    View other trading pairs
                    <img src={images['icon-arrow-right-green']} alt="" />
                </Link>
            </div>
        );
    }
}

PairPicker.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
