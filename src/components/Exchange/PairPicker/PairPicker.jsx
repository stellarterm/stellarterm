import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import millify from 'millify';
import Driver from '../../../lib/Driver';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';
import AssetPair from '../../Common/AssetPair/AssetPair';

const RESOLUTION_MINUTE = 60;
// 24 hour = 96 section of 15 min;
// 15 min = 900 s
const RESOLUTION_15_MINUTES = 900;
const LIMIT_15_MINUTES = 96;
const PERIOD = 86400000;

export default class PairPicker extends React.Component {
    static get24ChangesPercent(state) {
        const { last24HourTrades, lastMinutesTrade } = state;
        if (!last24HourTrades || !lastMinutesTrade || !last24HourTrades.length) {
            return null;
        }
        const startPeriodIndex = last24HourTrades.length - 1;
        const startPrice = parseFloat(last24HourTrades[startPeriodIndex].open);
        const finishPrice = parseFloat(lastMinutesTrade.records[0].open);
        return (((finishPrice / startPrice) - 1) * 100).toFixed(2);
    }

    constructor(props) {
        super(props);
        this.state = {
            last24HourTrades: undefined,
            lastMinutesTrade: undefined,
            lastChangesDirection: '',
        };
    }

    componentDidMount() {
        this._mounted = true;
        this.getLastTrades();
        this.unsub = this.props.d.ticker.event.sub(() => {
            this.forceUpdate();
        });
    }

    componentWillUpdate(nextProps, nextState) {
        const nextChanges = parseFloat(this.constructor.get24ChangesPercent(nextState));
        const prevChanges = parseFloat(this.constructor.get24ChangesPercent(this.state));
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
        const { last24HourTrades, lastMinutesTrade } = this.state;

        if (!last24HourTrades || !lastMinutesTrade) {
            return {
                status: 'load',
            };
        }

        if (last24HourTrades.length === 0) {
            return {
                status: 'no_trades',
            };
        }
        const lastPrice = parseFloat(lastMinutesTrade.records[0].open);
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

        return {
            status: 'trades_fully',
            lastPrice,
            changes24,
            volume24,
            price24low,
            price24high,
        };
    }

    async getLastTrades() {
        const lastTradesWithStep15min =
            await this.props.d.orderbook.handlers.getTrades(RESOLUTION_15_MINUTES, LIMIT_15_MINUTES);
        const lastMinutesTrade = await this.props.d.orderbook.handlers.getTrades(RESOLUTION_MINUTE, 1);

        if (!this._mounted) {
            return;
        }
        const last24HourTrades = lastTradesWithStep15min.records
                .filter(record => ((new Date() - record.timestamp) < PERIOD));

        this.setState({
            last24HourTrades,
            lastMinutesTrade,
        });

        // Update every 15 seconds
        this.updateDataTimeout = setTimeout(() => this.getLastTrades(), 15000);
    }

    getPairMarketsTableContent() {
        const { d } = this.props;
        const { counterSelling } = d.orderbook.data;
        const counterAssetCode = counterSelling.getCode();
        const { status, lastPrice, changes24, volume24, price24low, price24high } = this.getPairMarketsData();

        if (status === 'load') {
            return (
                <div className="PairPicker_marketsTable-content">
                    <span><Ellipsis /></span>
                    <span><Ellipsis /></span>
                    <span><Ellipsis /></span>
                    <span><Ellipsis /></span>
                    <span><Ellipsis /></span>
                </div>
            );
        }

        if (status === 'no_trades') {
            return (
                <div className="PairPicker_marketsTable-content">
                    <span>—</span><span>—</span><span>—</span><span>—</span><span>—</span>
                </div>
            );
        }

        const noChanges = changes24 === '0.00';
        const changesClassName = (changes24 >= 0) ? 'positive' : 'negative';

        return (
            <div className="PairPicker_marketsTable-content">
                <span>{lastPrice} {counterAssetCode}</span>
                <span className={noChanges ? '' : changesClassName}>
                            <span className={this.state.lastChangesDirection}>{changes24 > 0 && '+'}{changes24}%</span>
                        </span>
                <span>{price24high} {counterAssetCode}</span>
                <span>{price24low} {counterAssetCode}</span>
                <span>{millify(volume24)} {counterAssetCode}</span>
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
                        <span>Last price</span>
                        <span>24h changes </span>
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
