import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';
import processOrderbook from './processOrderbook';
import DepthChartD3 from './DepthChartD3';

const DepthChart = ({ d }) => {
    const [chart, setChart] = useState(null);
    const [isHidden, setIsHidden] = useState(document.hidden);
    const { asks: asksFromHorizon, bids: bidsFromHorizon, baseBuying, counterSelling } = d.orderbook.data;

    if (!asksFromHorizon.length && !bidsFromHorizon.length) {
        return (
            <div className="OfferTables">
                <div className="island__sub__division">
                    <h3 className="island__sub__division__title">Orderbook is empty</h3>
                </div>
            </div>
        );
    }

    // check for a thin orderbook
    if (asksFromHorizon.length < 2 || bidsFromHorizon.length < 2) {
        return (
            <div className="OfferTables">
                <div className="island__sub__division">
                    <h3 className="island__sub__division__title">Not enough data to display market depth.</h3>
                </div>
            </div>
        );
    }

    const { asks, bids } = processOrderbook(asksFromHorizon, bidsFromHorizon);

    useEffect(() => {
        const chartInstance = new DepthChartD3(baseBuying, counterSelling);
        chartInstance.initializeChart();
        setChart(chartInstance);
    }, []);

    const onVisibilityChange = () => {
        setIsHidden(document.hidden);
    };

    useEffect(() => {
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        if (!chart) {
            return;
        }
        if (isHidden) {
            return;
        }
        chart.updateChart(
            asks,
            bids,
        );
    }, [d.orderbook.data.bids, d.orderbook.data.asks, chart, isHidden]);


    return (
        <div id="depth-chart" />
    );
};

export default DepthChart;

DepthChart.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
