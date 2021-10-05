/* eslint-disable no-param-reassign */
import * as amcharts from './amcharts';
// eslint-disable-next-line camelcase
import am4themes_frozen from '@amcharts/amcharts4/themes/frozen';
import React, { useEffect, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../lib/Driver';

const addChart = (chart, baseBuying, counterSelling) => {
    const base = baseBuying.code;
    const counter = counterSelling.code;
    const xAxisTitle = `Price (${base}/${counter})`;
    // Set up precision for numbers
    chart.numberFormatter.numberFormat = '#,###.####';

    // Create axes
    const xAxis = chart.xAxes.push(new amcharts.CategoryAxis());
    xAxis.dataFields.category = 'value';
    // xAxis.renderer.grid.template.location = 0;
    xAxis.renderer.minGridDistance = 100;
    xAxis.title.text = xAxisTitle;

    const yAxis = chart.yAxes.push(new amcharts.ValueAxis());
    yAxis.title.text = 'Volume';

    // Create series
    const series = chart.series.push(new amcharts.StepLineSeries());
    series.dataFields.categoryX = 'value';
    series.dataFields.valueY = 'bidsTotalVolume';
    series.strokeWidth = 2;
    series.stroke = amcharts.color('#0f0');
    series.fill = series.stroke;
    series.fillOpacity = 0.1;
    series.tooltipText = `Price: [bold]{categoryX}[/]\nAmount: [bold]{bidsAmount} ${base}[/]\nSum: [bold]{bidsSum} ${counter}[/]\nDepth: [bold]{valueY} ${counter}[/]`;

    const series2 = chart.series.push(new amcharts.StepLineSeries());
    series2.dataFields.categoryX = 'value';
    series2.dataFields.valueY = 'asksTotalVolume';
    series2.strokeWidth = 2;
    series2.stroke = amcharts.color('#f00');
    series2.fill = series2.stroke;
    series2.fillOpacity = 0.1;
    series2.tooltipText = `Price: [bold]{categoryX}[/]\nAmount: [bold]{asksAmount} ${base}[/]\nSum: [bold]{asksSum} ${counter}[/]\nTotal volume: [bold]{valueY} ${counter}[/]`;

    const series3 = chart.series.push(new amcharts.ColumnSeries());
    series3.dataFields.categoryX = 'value';
    series3.dataFields.valueY = 'bidsSum';
    series3.strokeWidth = 0;
    series3.fill = amcharts.color('#0f0');
    series3.fillOpacity = 0.5;

    const series4 = chart.series.push(new amcharts.ColumnSeries());
    series4.dataFields.categoryX = 'value';
    series4.dataFields.valueY = 'asksSum';
    series4.strokeWidth = 0;
    series4.fill = amcharts.color('#f00');
    series4.fillOpacity = 0.5;

    // Add cursor
    chart.cursor = new amcharts.XYCursor();
};

const processOrderbook = ob => {
    const { asks } = ob.asks.reduce((acc, ask) => {
        acc.total += (+ask.amount * +ask.price);
        acc.asks.push({
            value: +ask.price,
            asksAmount: +ask.amount,
            asksSum: (+ask.amount * +ask.price),
            asksTotalVolume: acc.total,
        });
        return acc;
    }, { asks: [], total: 0 });

    const { bids } = ob.bids.reduce((acc, bid) => {
        acc.total += +bid.amount;
        acc.bids.push({
            value: +bid.price,
            bidsSum: +bid.amount,
            bidsAmount: (+bid.amount / +bid.price),
            bidsTotalVolume: acc.total,
        });
        return acc;
    }, { bids: [], total: 0 });

    return [...bids.reverse(), ...asks];
};

const DepthChart = ({ d }) => {
    const orderbook = d.orderbook.data;
    const isOrderbookEmpty = orderbook.asks.length === 0 && orderbook.bids.length === 0;

    const { baseBuying, counterSelling } = orderbook;

    if (!orderbook.ready) {
        return <div>Loading</div>;
    }

    const chart = useRef(null);

    useLayoutEffect(() => {
        amcharts.useTheme(am4themes_frozen);

        const chartInstance = amcharts.create('chartdiv', amcharts.XYChart);

        // ...
        chart.current = chartInstance;

        chart.current.data = processOrderbook(orderbook);

        addChart(chart.current, baseBuying, counterSelling);

        return () => {
            chartInstance.dispose();
        };
    }, []);

    useEffect(() => {
        const unsub = d.orderbook.event.sub(() => {
            if (chart.current) {
                chart.current.data = processOrderbook(orderbook);
                setTimeout(() => {
                    chart.current.cursor.triggerMove(chart.current.cursor.point, 'none', true);
                });
            }
        });

        return () => unsub();
    }, []);

    if (isOrderbookEmpty) {
        return (
            <div className="OfferTables">
                <div className="island__sub__division">
                    <h3 className="island__sub__division__title">Orderbook is empty</h3>
                </div>
            </div>
        );
    }

    return (<div
        id="chartdiv"
        style={{
            height: 600,
        }}
    />);
};
export default DepthChart;

DepthChart.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
