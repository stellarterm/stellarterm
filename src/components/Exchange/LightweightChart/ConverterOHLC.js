import moment from 'moment';
import { volumeDownColor, volumeUpColor } from './LightweightChartOptions';

export const FRAME_MINUTE = 60;
export const FRAME_5MINUTES = 300;
export const FRAME_FOURTH_HOUR = 900;
export const FRAME_HOUR = 3600;
export const FRAME_DAY = 86400;
export const FRAME_WEEK = 604800;
export const ZEROS_NUMBER = 7;
export const TRADE_OFFSET = moment(new Date()).utcOffset() * 60;

export function fillWithZeros(value) {
    // Fill value with zeros on the end, 1.4 => 1.4000000
    const fractionNumber = String(value).split('.')[1] || '0';

    return fractionNumber.length <= ZEROS_NUMBER ? value.toFixed(ZEROS_NUMBER) : value;
}

export function getVolumeData(trades, { baseBuying, counterSelling }) {
    return trades.map((trade) => {
        // Displays XLM volume, if traded to xlm, else used base_volume
        const isBaseNativeXLM = baseBuying.code === 'XLM' && baseBuying.issuer === undefined;
        const isCounterNativeXLM = counterSelling.code === 'XLM' && counterSelling.issuer === undefined;
        const isTradeToXLM = isBaseNativeXLM || isCounterNativeXLM;

        const volumeXLM = isBaseNativeXLM ? trade.baseVolume : trade.counterVolume;
        const volume = isTradeToXLM ? volumeXLM : trade.baseVolume;

        return {
            time: trade.time,
            value: parseFloat(volume.toFixed(7)),
            color: trade.open <= trade.close ? volumeUpColor : volumeDownColor,
            volumeName: isTradeToXLM ? 'XLM' : baseBuying.code,
        };
    });
}

export function convertTimeframeData(trades, timeFrame) {
    const nullTrades = [];
    trades.forEach((trade, index) => {
        const tradesInterval = index !== 0 ? trade.time - trades[index - 1].time : timeFrame;
        const nullIntervalsCount = (tradesInterval / timeFrame) - 1;
        for (let i = 1; i <= nullIntervalsCount; i++) {
            const nullTrade = {
                time: trades[index - 1].time + (timeFrame * i),
                open: trades[index - 1].close,
                high: trades[index - 1].open,
                low: trades[index - 1].open,
                close: trades[index - 1].close,
                baseVolume: 0,
                counterVolume: 0,
            };
            nullTrades.push(nullTrade);
        }
    });

    const filledTrades = [...trades, ...nullTrades].sort((a, b) => a.time - b.time);

    // Set candle open price from previous candle close
    return filledTrades.map((trade, index) => {
        const prevTradeClose = index === 0 ? trade.open : filledTrades[index - 1].close;
        trade.open = prevTradeClose;
        return trade;
    });
}

export function aggregationToOhlc(trades, timeFrame) {
    // Adds minutes time offset for chart trade points
    const dynamicTradeOffset = timeFrame >= FRAME_DAY ? 0 : TRADE_OFFSET;

    const ohlsTrades = trades
        .map(trade => ({
            time: (new Date(trade.timestamp).getTime() / 1000) + dynamicTradeOffset,
            close: parseFloat(trade.close),
            open: parseFloat(trade.open),
            high: parseFloat(trade.high),
            low: parseFloat(trade.low),
            baseVolume: parseFloat(trade.base_volume),
            counterVolume: parseFloat(trade.counter_volume),
            avg: parseFloat(trade.avg),
        }))
        .sort((a, b) => a.time - b.time);

    return convertTimeframeData(ohlsTrades, timeFrame);
}
