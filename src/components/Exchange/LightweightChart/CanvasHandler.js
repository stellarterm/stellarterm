import moment from 'moment';
import UTCTimeString from './UtcTimeString/UtcTimeString';
import { getReadableNumber } from './ConverterOHLC';

const canvasTopOffset = 80;
const moreCanvasWidth = 30;
const imagePadding = 15;

function drawChartData(ctx, w, h, pairName, timeFrameInMin, trade, volume) {
    const creationTime = moment(new Date()).format('MMMM DD YYYY');
    const creationDateString = `Created with StellarTerm.com, ${creationTime}, ${UTCTimeString.getUtcString()} `;
    const pxOffsetFromTime = timeFrameInMin > 60 ? 180 : 150;

    // Fill padding with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvasTopOffset);
    ctx.beginPath();
    ctx.lineWidth = '30';
    ctx.strokeStyle = '#ffffff';
    ctx.rect(0, canvasTopOffset - imagePadding, w, (h - canvasTopOffset) + imagePadding);
    ctx.stroke();

    ctx.lineWidth = '1';
    ctx.strokeStyle = '#999999';
    ctx.beginPath();
    ctx.moveTo(1, 1);
    ctx.lineTo(w, 1);
    ctx.moveTo(0, canvasTopOffset);
    ctx.lineTo(w, canvasTopOffset);
    ctx.stroke();

    ctx.font = 'normal 16px Source Sans Pro';
    ctx.fillStyle = '#999999';
    ctx.fillText(`${creationDateString}`, 15, 24);

    ctx.fillStyle = '#0e0e0e';
    ctx.font = '900 21px Source Sans Pro';
    ctx.fillText(`${pairName}, ${timeFrameInMin}`, 15, 56);

    const ohlcString = `O:  ${getReadableNumber(trade.open)}  H:  ${getReadableNumber(trade.high)}  L:  ${getReadableNumber(trade.low)}  C:  ${getReadableNumber(trade.close)}  V:  ${getReadableNumber(volume.value)}`;    ctx.fillStyle = '#999999';
    ctx.fillText(ohlcString, pxOffsetFromTime, 56);

    ctx.font = 'bold 32px Source Sans Pro';
    ctx.fillStyle = '#68c86f';
    ctx.fillText('StellarTerm', w - 180, 48);
}

export default function exportChartPng(canvas, imageName, pairName, timeFrameInMin, trade, volume) {
    const oldCanvas = canvas.toDataURL('image/png');
    const chart = new Image();
    chart.src = oldCanvas;

    chart.onload = () => {
        canvas.height += canvasTopOffset + imagePadding;
        canvas.width += moreCanvasWidth;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(chart, imagePadding, canvasTopOffset);
        drawChartData(ctx, canvas.width, canvas.height, pairName, timeFrameInMin, trade, volume);

        const screenshotPng = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = screenshotPng;
        downloadLink.download = imageName;
        downloadLink.click();
    };
}
