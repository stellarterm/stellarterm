import { createChart } from '../../../../node_modules/lightweight-charts/dist/lightweight-charts.esm.production';

export const volumeUpColor = 'rgba(76, 175, 80, 0.5)';
export const volumeDownColor = 'rgba(239, 83, 80, 0.5)';

const SDEX_PRICE_FORMAT = { type: 'price', precision: 7, minMove: 0.0000001 };
const gridLineColor = 'rgba(70, 130, 180, 0.5)';
const bordersColor = 'rgba(0, 0, 0, 0.4)';
const candleUpColor = '#4caf50';
const candleDownColor = '#ef5350';
const areaChartColor = '#6AD0FE';
const areaChartTopColor = '#c0ecff';
const areaChartDownColor = 'rgba(0, 120, 255, 0.0)';

export function createLightChart(element, cursorMode) {
    return createChart(element, {
        width: element.clientWidth,
        height: element.clientHeight,
        priceScale: {
            autoScale: true,
            invertScale: false,
            alignLabels: true,
            borderVisible: true,
            borderColor: bordersColor,
            scaleMargins: {
                top: 0.1,
                bottom: 0.2,
            },
        },
        timeScale: {
            rightOffset: 10,
            fixLeftEdge: false,
            lockVisibleTimeRangeOnResize: true,
            rightBarStaysOnScroll: true,
            borderVisible: true,
            borderColor: bordersColor,
            visible: true,
            timeVisible: true,
        },
        crosshair: {
            vertLine: {
                color: bordersColor,
                width: 1,
                style: 3,
                visible: true,
                labelVisible: true,
            },
            horzLine: {
                color: bordersColor,
                width: 1,
                style: 3,
                visible: true,
                labelVisible: true,
            },
            mode: cursorMode,
        },
        grid: {
            vertLines: {
                color: gridLineColor,
                style: 1,
                visible: true,
            },
            horzLines: {
                color: gridLineColor,
                style: 1,
                visible: true,
            },
        },
        localization: {
            locale: 'en-US',
        },
        handleScale: {
            axisPressedMouseMove: false,
        },
    });
}

export function getAreaOptions() {
    return {
        topColor: areaChartTopColor,
        bottomColor: areaChartDownColor,
        lineColor: areaChartColor,
        lineWidth: 3,
        priceFormat: SDEX_PRICE_FORMAT,
    };
}

export function getCandlestickOptions() {
    return {
        upColor: candleUpColor,
        downColor: candleDownColor,
        wickVisible: true,
        borderVisible: true,
        priceFormat: SDEX_PRICE_FORMAT,
    };
}

export function getBarOptions() {
    return {
        upColor: candleUpColor,
        downColor: candleDownColor,
        priceFormat: SDEX_PRICE_FORMAT,
        thinBars: false,
        openVisible: true,
    };
}

export function getVolumeOptions() {
    return {
        color: volumeUpColor,
        priceLineVisible: false,
        lastValueVisible: false,
        overlay: true,
        priceFormat: {
            type: 'volume',
        },
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    };
}
