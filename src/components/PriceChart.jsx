import React from 'react';
import PropTypes from 'prop-types';
import Ellipsis from './Ellipsis';
import Driver from '../lib/Driver';
import chartOptions from './ChartOptions';

export default class PriceChart extends React.Component {
    constructor(props) {
        super(props);
        this.rendered = false;
    }

    componentDidMount() {
        const { data, event } = this.props.d.orderbook;

        if (data.trades !== undefined) {
            this.renderChart(data, data.trades);
        } else {
            this.unsub = event.sub(() => {
                if (!this.rendered && data.trades !== undefined) {
                    this.renderChart(data, data.trades);
                }
            });
        }
    }

    shouldComponentUpdate() {
        if (this.stockChart !== undefined) {
            this.stockChart.series[0].setData(this.orderbook.trades);
        }
        return false;
    }

    componentWillUnmount() {
        if (this.unsub) {
            this.unsub();
        }
    }

    renderChart(orderbook) {
        this.rendered = true;
        const elem = document.getElementById('PriceChart');
        window.elem = elem;

        const pairName = `${orderbook.baseBuying.code}/${orderbook.counterSelling.code}`;
        this.orderbook = orderbook;
        if (orderbook.trades.length === 0) {
            elem.querySelector('p').textContent = `No trade history for ${pairName}`;
            return;
        }

        this.stockChart = window.Highcharts.stockChart(
            'PriceChart',
            chartOptions(elem.clientHeight, elem.clientWidth, orderbook, pairName),
        );
    }

    render() {
        return (
            <div className="so-back islandBack">
                <div className="island PriceChartChunk">
                    <div id="PriceChart">
                        <p className="PriceChart__message">
                            Loading historical price data
                            <Ellipsis />
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

PriceChart.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
