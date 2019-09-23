import React from 'react';
import PropTypes from 'prop-types';
import { fillWithZeros } from '../ConverterOHLC';

export default class ChartDataPanel extends React.Component {
    constructor(props) {
        super(props);
        this.listenerInitialized = false;
        this.state = {};
    }

    componentDidMount() {
        this.initListener();
    }

    componentWillUnmount() {
        this.props.chart.unsubscribeCrosshairMove();
    }

    initListener() {
        if (this.listenerInitialized || !this.props.chart) {
            return;
        }
        this.props.chart.subscribeCrosshairMove(({ point, time }) => {
            if (!point || !time) {
                return;
            }
            const pointTrade = this.props.trades.find(trade => trade.time === time);
            const pointVolume = this.props.volumes.find(volume => volume.time === time);

            this.setState({ trade: pointTrade, volume: pointVolume });
        });
        this.listenerInitialized = true;
    }

    render() {
        const { trade, volume } = this.state;

        if (!this.listenerInitialized || !trade || !volume) {
            return null;
        }

        const spanClass = `data_Item ${trade.open > trade.close ? 'changeNegative' : 'changePositive'}`;

        return (
            <div className="data_Panel">
                <div className="chart_Data">
                    <div className="pair_Name">{this.props.pairName}</div>
                    <span className="data_Title">O:</span>{' '}
                    <span className={spanClass}>{fillWithZeros(trade.open)}</span>
                    <span className="data_Title">H:</span>{' '}
                    <span className={spanClass}>{fillWithZeros(trade.high)}</span>
                    <span className="data_Title">L:</span>{' '}
                    <span className={spanClass}>{fillWithZeros(trade.low)}</span>
                    <span className="data_Title">C:</span>{' '}
                    <span className={spanClass}>{fillWithZeros(trade.close)}</span>
                    <span className="title_Volume">Volume ({volume.volumeName}):</span>{' '}
                    <span className={`data_Volume ${spanClass}`}>{fillWithZeros(volume.value)}</span>
                </div>
            </div>
        );
    }
}

ChartDataPanel.propTypes = {
    chart: PropTypes.objectOf(PropTypes.object),
    trades: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.number)),
    volumes: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string]))),
    pairName: PropTypes.string,
};
