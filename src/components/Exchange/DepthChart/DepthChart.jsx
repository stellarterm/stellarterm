import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DepthChartD3 from './DepthChartD3';

const EmptyState = () => (
    <div className="OfferTables">
        <div className="island__sub__division">
            <h3 className="island__sub__division__title">Not enough data to display market depth.</h3>
        </div>
    </div>
);

const DepthChart = ({ asks, bids, baseBuying, counterSelling, isLinear }) => {
    const [chart, setChart] = useState(null);
    const [isHidden, setIsHidden] = useState(document.hidden);

    // check for a thin orderbook
    if (asks.length < 2 || bids.length < 2) {
        return (
            <EmptyState />
        );
    }

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
            isLinear,
        );
    }, [bids, asks, chart, isHidden, isLinear]);


    return (
        <div id="depth-chart" />
    );
};

export default DepthChart;

DepthChart.propTypes = {
    isLinear: PropTypes.bool.isRequired,
    asks: PropTypes.arrayOf(PropTypes.any).isRequired,
    bids: PropTypes.arrayOf(PropTypes.any).isRequired,
    baseBuying: PropTypes.objectOf(PropTypes.any).isRequired,
    counterSelling: PropTypes.objectOf(PropTypes.any).isRequired,
};
