import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';
import images from '../../../images';

import * as chartOptions from './LightweightChartOptions';
import * as converterOHLC from './ConverterOHLC';
import Ellipsis from '../../Common/Ellipsis/Ellipsis';

import {
    CrosshairMode,
    PriceScaleMode,
} from '../../../../node_modules/lightweight-charts/dist/lightweight-charts.esm.production';
import UtcTimeString from './UtcTimeString/UtcTimeString';
import ChartDataPanel from './ChartDataPanel/ChartDataPanel';

export default class LightweightChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            chartInited: false,
            isLoadingNext: false,
            isLoadingInit: true,
            60: { trades: [], volumes: [] },
            300: { trades: [], volumes: [] },
            900: { trades: [], volumes: [] },
            3600: { trades: [], volumes: [] },
            86400: { trades: [], volumes: [] },
            604800: { trades: [], volumes: [] },
        };
    }

    componentWillMount() {
        this.getTrades(this.props.timeFrame);
    }

    componentDidMount() {
        this.chartInit();
    }

    shouldComponentUpdate() {
        return this.CHART !== undefined;
    }

    componentDidUpdate(prevProps, prevState) {
        const chartSeriesIsChanged =
            prevProps.lineChart !== this.props.lineChart ||
            prevProps.candlestickChart !== this.props.candlestickChart ||
            prevProps.barChart !== this.props.barChart;

        this.applyChartOptions();

        if (prevProps.timeFrame !== this.props.timeFrame || prevState.isLoadingInit) {
            this.CHART.timeScale().fitContent();
        }

        if (chartSeriesIsChanged) {
            this.setChartSeries();
        }
        this.setChartData();
    }

    componentWillUnmount() {
        this.CHART.unsubscribeVisibleTimeRangeChange();
    }

    onClickTimeFrameBtn(timeFrame) {
        this.props.onUpdate('timeFrame', timeFrame);
        if (this.state[timeFrame].trades.length === 0) {
            this.setState({ isLoadingInit: true });
            this.getTrades(timeFrame);
        }
    }

    getTrades(timeFrame) {
        const { fullHistoryLoaded } = this.state[timeFrame];
        const { data, handlers } = this.props.d.orderbook;

        if (fullHistoryLoaded) { return; }

        handlers.getTrades(timeFrame).then((res) => {
            const fullLoaded = res.records.length === 0;
            const convertedTrades = converterOHLC.aggregationToOhlc([...res.records], timeFrame);
            const convertedVolume = converterOHLC.getVolumeData(convertedTrades, data);

            this.setState({
                isLoadingInit: false,
                [timeFrame]: {
                    trades: convertedTrades,
                    volumes: convertedVolume,
                    nextTrades: res.next,
                    fullHistoryLoaded: fullLoaded,
                },
            });
        });
    }

    getNextTrades() {
        const { timeFrame, d } = this.props;
        const { fullHistoryLoaded } = this.state[timeFrame];

        if (fullHistoryLoaded) { return; }

        this.setState({ isLoadingNext: true });
        this.state[timeFrame].nextTrades().then((res) => {
            const fullLoaded = res.records.length === 0;
            const convertedTrades = converterOHLC.aggregationToOhlc([...res.records], timeFrame);
            const convertedVolume = converterOHLC.getVolumeData(convertedTrades, d.orderbook.data);
            const concatedTrades = [...convertedTrades, ...this.state[timeFrame].trades];
            const concatedVolumes = [...convertedVolume, ...this.state[timeFrame].volumes];

            this.setState({
                isLoadingNext: false,
                [timeFrame]: {
                    trades: concatedTrades,
                    volumes: concatedVolumes,
                    nextTrades: res.next,
                    fullHistoryLoaded: fullLoaded,
                },
            });
        });
    }

    setChartData() {
        const { timeFrame } = this.props;
        this.ohlcSeries.setData(this.state[timeFrame].trades);
        this.volumeSeries.setData(this.state[timeFrame].volumes);
    }

    getTimeFrameBtn(btnText, timeFrame) {
        return (
            <a
                className={`timeBtn ${this.props.timeFrame === timeFrame ? 'timeBtn_active' : ''}`}
                onClick={() => this.onClickTimeFrameBtn(timeFrame)}>
                {btnText}
            </a>
        );
    }

    getChangeScaleBtn(text, scaleMode) {
        return (
            <a
                className={`scaleBtn ${this.props.scaleMode === scaleMode ? 'scaleBtn_active' : ''}`}
                onClick={() => this.props.onUpdate('scaleMode', scaleMode)}>
                {text}
            </a>
        );
    }

    setChartSeries() {
        const { lineChart, barChart, candlestickChart } = this.props;

        if (this.ohlcSeries !== undefined) {
            this.CHART.removeSeries(this.ohlcSeries);
        }

        if (barChart) {
            this.ohlcSeries = this.CHART.addBarSeries(chartOptions.getBarOptions());
        } else if (candlestickChart) {
            this.ohlcSeries = this.CHART.addCandlestickSeries(chartOptions.getCandlestickOptions());
        } else if (lineChart) {
            this.ohlcSeries = this.CHART.addAreaSeries(chartOptions.getLineOptions());
        }
    }

    setChartSettings() {
        const chartCursorMode = this.props.lineChart ? CrosshairMode.Magnet : CrosshairMode.Normal;

        this.CHART = chartOptions.createLightChart(window.lightChart, chartCursorMode);
        this.volumeSeries = this.CHART.addHistogramSeries(chartOptions.getVolumeOptions());
        this.setChartSeries();

        this.CHART.subscribeVisibleTimeRangeChange((param) => {
            if (!param || !param.from) { return; }

            const lastTradeElement = this.state[this.props.timeFrame].trades[0];
            const tradesIsLoaded = this.state[this.props.timeFrame].trades.length !== 0;

            if (tradesIsLoaded && param.from === lastTradeElement.time && !this.state.isLoadingNext) {
                this.getNextTrades();
            }
        });

        this.setState({ chartInited: true });
    }

    chartInit() {
        window.lightChart = document.getElementById('LightChart');

        if (!this.state.chartInited) {
            this.setChartSettings();
        }
    }

    applyChartOptions() {
        const chart = document.getElementById('LightChart');

        this.CHART.applyOptions({
            width: chart.clientWidth,
            height: chart.clientHeight,
            priceScale: { mode: this.props.scaleMode },
        });
    }

    render() {
        const { chartInited, isLoadingInit } = this.state;
        const { data } = this.props.d.orderbook;
        const { trades, volumes } = this.state[this.props.timeFrame];
        const noDataFounded = trades.length === 0;
        const showChartControls = chartInited && !isLoadingInit && !noDataFounded;
        const pairName = `${data.baseBuying.code}/${data.counterSelling.code}`;

        return (
            <React.Fragment>
                {showChartControls ? (
                    <ChartDataPanel
                        chart={this.CHART}
                        timeFrame={this.props.timeFrame}
                        trades={trades}
                        volumes={volumes}
                        pairName={pairName} />
                ) : null}

                <div className={this.props.fullscreen ? 'chart_Msg_Container_fullscreen' : 'chart_Msg_Container'}>
                    <div id="LightChart" style={isLoadingInit || noDataFounded ? { display: 'none' } : {}} />
                    {noDataFounded && !isLoadingInit ? (
                        <p className="chart_message">No trade history founded!</p>
                    ) : null}
                    {isLoadingInit ? (
                        <p className="chart_message">
                            Loading historical price data
                            <Ellipsis />
                        </p>
                    ) : null}
                </div>

                {showChartControls ? (
                    <div className="chart_Settings_Panel">
                        <div className="timeFrame_btns">
                            {this.getTimeFrameBtn('1m', converterOHLC.FRAME_MINUTE)}
                            {this.getTimeFrameBtn('5m', converterOHLC.FRAME_5MINUTES)}
                            {this.getTimeFrameBtn('15m', converterOHLC.FRAME_FOURTH_HOUR)}
                            {this.getTimeFrameBtn('1h', converterOHLC.FRAME_HOUR)}
                            {this.getTimeFrameBtn('1d', converterOHLC.FRAME_DAY)}
                            {this.getTimeFrameBtn('1w', converterOHLC.FRAME_WEEK)}
                        </div>
                        <div className="scale_Settings">
                            <UtcTimeString />
                            <div className="priceScale_Btns">
                                {this.getChangeScaleBtn('%', PriceScaleMode.Percentage)}
                                {this.getChangeScaleBtn('Log', PriceScaleMode.Logarithmic)}
                                {this.getChangeScaleBtn('Normal', PriceScaleMode.Normal)}
                            </div>
                        </div>
                        <a className="scrollTime_btn" onClick={() => this.CHART.timeScale().scrollToRealTime()}>
                            <img src={images['icon-rightArrow']} alt="arrow" />
                        </a>
                    </div>
                ) : null}
            </React.Fragment>
        );
    }
}

LightweightChart.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    onUpdate: PropTypes.func.isRequired,
    timeFrame: PropTypes.number.isRequired,
    scaleMode: PropTypes.number,
    candlestickChart: PropTypes.bool,
    barChart: PropTypes.bool,
    lineChart: PropTypes.bool,
    fullscreen: PropTypes.bool,
};
