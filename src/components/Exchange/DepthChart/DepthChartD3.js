import * as d3 from 'd3';
import { roundAndFormat, formatNumber } from '../../../lib/Format';
import {
    ASKS_LINE_COLOR,
    AXIS_TOOLTIP_BORDER_RADIUS,
    AXIS_TOOLTIP_FILL,
    AXIS_TOOLTIP_FONT_SIZE,
    AXIS_TOOLTIP_FONT_WEIGHT,
    AXIS_TOOLTIP_MARGIN,
    AXIS_TOOLTIP_OFFSET,
    AXIS_TOOLTIP_TEXT_COLOR,
    AXIS_TOOLTIP_TRIANGLE_SIZE,
    AXIS_Y_INCREASE_COEFFICIENT,
    BIDS_LINE_COLOR,
    CIRCLE_FILL,
    CIRCLE_RADIUS,
    CIRCLE_STROKE_WIDTH,
    CIRCLE_THRESHOLD,
    CROSSHAIR_STROKE,
    CROSSHAIR_STROKE_DASHARRAY,
    CROSSHAIR_STROKE_WIDTH, DATA_TOOLTIP_BORDER_RADIUS,
    DATA_TOOLTIP_COLOR,
    DATA_TOOLTIP_FONT_SIZE,
    DATA_TOOLTIP_LINE_HEIGHT,
    DATA_TOOLTIP_MARGIN,
    DATA_TOOLTIP_OFFSET_X,
    DATA_TOOLTIP_OFFSET_Y,
    DATA_TOOLTIP_OPACITY, DATA_TOOLTIP_TEXT_COLOR,
    DATA_TOOLTIP_TRIANGLE_SIZE,
    FOCUS_CIRCLE_RADIUS,
    FOCUS_CIRCLE_STROKE,
    FOCUS_CIRCLE_STROKE_WIDTH,
    HEIGHT,
    INITIAL_ANIMATION_DURATION,
    LINE_CHART_STROKE_WIDTH,
    MARGIN_BOTTOM,
    MARGIN_LEFT,
    MARGIN_TOP,
    STOP_GRADIENT_COLOR, UPDATE_ANIMATION_DURATION,
    WIDTH,
} from './depthChartConstants';


const getPriceValue = orderbookItem => (orderbookItem.price_r.n / orderbookItem.price_r.d);

function getLeftTooltipPathD(width, height, marginRight, borderRadius, triangleSize) {
    return `M -${width + triangleSize + marginRight} -${(height / 2) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 -${((width + triangleSize) + marginRight) - borderRadius} -${height / 2} H -${marginRight + triangleSize + borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 -${marginRight + triangleSize} -${(height / 2) - borderRadius} V -${triangleSize} L -${marginRight} 0 L -${marginRight + triangleSize} ${triangleSize} V ${(height / 2) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 -${marginRight + triangleSize + borderRadius} ${height / 2} H -${((width + triangleSize) + marginRight) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 -${width + marginRight + triangleSize} ${(height / 2) - borderRadius} Z`;
}

function getRightTooltipPathD(width, height, marginLeft, borderRadius, triangleSize) {
    return `M ${width + triangleSize + marginLeft} -${(height / 2) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 0 ${((width + triangleSize) + marginLeft) - borderRadius} -${height / 2} H ${marginLeft + triangleSize + borderRadius} A ${borderRadius} ${borderRadius} 0 0 0 ${marginLeft + triangleSize} -${(height / 2) - borderRadius} V -${triangleSize} L ${marginLeft} 0 L ${marginLeft + triangleSize} ${triangleSize} V ${(height / 2) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 0 ${marginLeft + triangleSize + borderRadius} ${height / 2} H ${((width + triangleSize) + marginLeft) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 0 ${width + marginLeft + triangleSize} ${(height / 2) - borderRadius} Z`;
}

function getBottomTooltipPathD(width, height, marginTop, borderRadius, triangleSize) {
    return `M 0 ${marginTop} L ${triangleSize} ${marginTop + triangleSize} H ${(width / 2) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 ${width / 2} ${marginTop + triangleSize + borderRadius} V ${((marginTop + triangleSize) + height) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 ${(width / 2) - borderRadius} ${height + marginTop + triangleSize} H -${(width / 2) - borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 -${width / 2} ${((marginTop + triangleSize) + height) - borderRadius} V ${marginTop + triangleSize + borderRadius} A ${borderRadius} ${borderRadius} 0 0 1 -${(width / 2) - borderRadius} ${marginTop + triangleSize} H -${triangleSize} Z`;
}

export default class DepthChartD3 {
    constructor(base, counter) {
        this.animationDuration = INITIAL_ANIMATION_DURATION;
        this.baseBuying = base;
        this.counterSelling = counter;

        this.svg = null;
        this.crosshair = null;
        this.tooltipX = null;
        this.tooltipY = null;
        this.focusAsks = null;
        this.focusBids = null;
        this.pathAsks = null;
        this.pathBids = null;
        this.textAsks = null;
        this.textBids = null;
        this.dotsGroup = null;
        this.asksLine = null;
        this.bidsLine = null;


        this.cachedPosition = null;
        this.asks = null;
        this.bids = null;

        this.xAxisLength = WIDTH - MARGIN_LEFT;
        this.yAxisLength = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

        this.scaleX = d3.scalePow().range([0, this.xAxisLength]);
        this.scaleY = d3.scaleLinear().range([0, this.yAxisLength]);

        this.axisX = d3.axisBottom().scale(this.scaleX);
        this.axisY = d3.axisLeft().scale(this.scaleY);

        this.line = d3.line()
            .x(data => this.scaleX(getPriceValue(data)) + MARGIN_LEFT)
            .y(data => this.scaleY(Number(data.sum)) + MARGIN_TOP);
    }

    initializeChart() {
        // ===========================================================
        // add main svg container
        this.svg = d3
            .select('#depth-chart')
            .append('svg')
            .attr('id', 'svg')
            .attr('height', HEIGHT)
            .attr('width', WIDTH);
        // ===========================================================
        // add axes
        this.svg
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(${MARGIN_LEFT}, ${HEIGHT - MARGIN_BOTTOM})`);
        this.svg
            .append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${MARGIN_LEFT}, ${MARGIN_TOP})`);

        // ===========================================================
        // add gradient styled and chart lines
        const asksGradient = this.svg
            .append('defs')
            .append('linearGradient')
            .attr('id', 'asksGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
        asksGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', ASKS_LINE_COLOR)
            .attr('stop-opacity', 0.6);
        asksGradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', STOP_GRADIENT_COLOR)
            .attr('stop-opacity', 0);

        const bidsGradient = this.svg
            .append('defs')
            .append('linearGradient')
            .attr('id', 'bidsGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
        bidsGradient
            .append('stop')
            .attr('offset', '0%')
            .attr('stop-color', BIDS_LINE_COLOR)
            .attr('stop-opacity', 0.6);
        bidsGradient
            .append('stop')
            .attr('offset', '100%')
            .attr('stop-color', STOP_GRADIENT_COLOR)
            .attr('stop-opacity', 0);

        this.asksLine = this.svg
            .append('path')
            .attr('class', 'asksLine')
            .attr('fill', 'url(#asksGradient)')
            .attr('stroke', ASKS_LINE_COLOR)
            .attr('stroke-width', LINE_CHART_STROKE_WIDTH);

        this.bidsLine = this.svg
            .append('path')
            .attr('class', 'bidsLine')
            .attr('fill', 'url(#bidsGradient)')
            .attr('stroke', BIDS_LINE_COLOR)
            .attr('stroke-width', LINE_CHART_STROKE_WIDTH);

        // ===========================================================
        // add crossHair
        this.crosshair = this.svg
            .append('g')
            .attr('class', 'crosshair');

        this.crosshair
            .append('line')
            .attr('id', 'h_crosshair') // horizontal cross hair
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 0)
            .style('stroke', CROSSHAIR_STROKE)
            .style('stroke-width', CROSSHAIR_STROKE_WIDTH)
            .style('stroke-dasharray', CROSSHAIR_STROKE_DASHARRAY)
            .style('display', 'none');

        this.crosshair
            .append('line')
            .attr('id', 'v_crosshair') // vertical cross hair
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 0)
            .style('stroke', CROSSHAIR_STROKE)
            .style('stroke-width', CROSSHAIR_STROKE_WIDTH)
            .style('stroke-dasharray', CROSSHAIR_STROKE_DASHARRAY)
            .style('display', 'none');

        // ===========================================================
        // add tooltips for axes
        this.tooltipX = this.svg
            .append('g')
            .style('display', 'none')
            .attr('class', 'tooltipX');

        this.tooltipX
            .append('path')
            .attr('fill', AXIS_TOOLTIP_FILL)
            .attr('class', 'tooltipXPath');

        this.tooltipX
            .append('text')
            .style('font-size', AXIS_TOOLTIP_FONT_SIZE)
            .attr('fill', AXIS_TOOLTIP_TEXT_COLOR)
            .style('font-weight', AXIS_TOOLTIP_FONT_WEIGHT)
            .attr('class', 'tooltipXText');


        this.tooltipY = this.svg
            .append('g')
            .style('display', 'none')
            .attr('class', 'tooltipY');

        this.tooltipY
            .append('path')
            .attr('fill', AXIS_TOOLTIP_FILL)
            .attr('class', 'tooltipYPath');

        this.tooltipY
            .append('text')
            .style('font-size', AXIS_TOOLTIP_FONT_SIZE)
            .attr('fill', AXIS_TOOLTIP_TEXT_COLOR)
            .style('font-weight', AXIS_TOOLTIP_FONT_WEIGHT)
            .attr('class', 'tooltipYText');

        this.dotsGroup = this.svg.append('g');

        this._addDataTooltipsTemplate();

        this._addMouseListeners();
    }

    updateChart(
        asks,
        bids,
    ) {
        this.asks = asks;
        this.bids = bids;

        this._updateAxes();
        this._updateBidsLine();
        this._updateAsksLine();

        if (this.cachedPosition) {
            this._onMouseMove(this.cachedPosition[0], this.cachedPosition[1]);
        } else {
            this.focusAsks.style('display', 'none');
            this.focusBids.style('display', 'none');
        }

        if (this.animationDuration === INITIAL_ANIMATION_DURATION) {
            this.animationDuration = UPDATE_ANIMATION_DURATION;
        }
    }

    _addDataTooltipsTemplate() {
        // ===========================================================
        // add circles and tooltips with chart data
        this.focusAsks = this.svg
            .append('g')
            .attr('class', 'focusAsks')
            .style('display', 'none')
            .attr('class', 'focusAsks');

        this.focusAsks
            .append('circle')
            .attr('stroke', FOCUS_CIRCLE_STROKE)
            .attr('stroke-width', FOCUS_CIRCLE_STROKE_WIDTH)
            .attr('fill', ASKS_LINE_COLOR)
            .attr('r', FOCUS_CIRCLE_RADIUS);

        this.focusBids = this.svg
            .append('g')
            .attr('class', 'focusBids')
            .style('display', 'none')
            .attr('class', 'focusBids');

        this.focusBids
            .append('circle')
            .attr('stroke', FOCUS_CIRCLE_STROKE)
            .attr('stroke-width', FOCUS_CIRCLE_STROKE_WIDTH)
            .attr('fill', BIDS_LINE_COLOR)
            .attr('r', FOCUS_CIRCLE_RADIUS);

        this.pathAsks = this.focusAsks
            .append('path')
            .attr('stroke', DATA_TOOLTIP_COLOR)
            .attr('stroke-opacity', DATA_TOOLTIP_OPACITY)
            .attr('fill', DATA_TOOLTIP_COLOR)
            .attr('fill-opacity', DATA_TOOLTIP_OPACITY);

        this.pathBids = this.focusBids
            .append('path')
            .attr('stroke', DATA_TOOLTIP_COLOR)
            .attr('stroke-opacity', DATA_TOOLTIP_OPACITY)
            .attr('fill', DATA_TOOLTIP_COLOR)
            .attr('fill-opacity', DATA_TOOLTIP_OPACITY);

        this.textAsks = this.focusAsks
            .append('text')
            .style('font-size', DATA_TOOLTIP_FONT_SIZE);
        this.textBids = this.focusBids
            .append('text')
            .style('font-size', DATA_TOOLTIP_FONT_SIZE);

        const asksPriceLine = this.textAsks.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        asksPriceLine.append('tspan').text('Price: ');
        asksPriceLine.append('tspan').style('font-weight', 'normal').attr('class', 'asksPriceValue');

        const asksAmountLine = this.textAsks.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        asksAmountLine.append('tspan').text('Amount: ');
        asksAmountLine.append('tspan').style('font-weight', 'normal').attr('class', 'asksAmountValue');

        const asksSumLine = this.textAsks.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        asksSumLine.append('tspan').text('Sum: ');
        asksSumLine.append('tspan').style('font-weight', 'normal').attr('class', 'asksSumValue');

        const asksTotalBaseLine = this.textAsks.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        asksTotalBaseLine.append('tspan').text(`Total ${this.baseBuying.code}: `);
        asksTotalBaseLine.append('tspan').style('font-weight', 'normal').attr('class', 'asksTotalBaseValue');

        const asksTotalCounterLine = this.textAsks.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        asksTotalCounterLine.append('tspan').text(`Total ${this.counterSelling.code}: `);
        asksTotalCounterLine.append('tspan').style('font-weight', 'normal').attr('class', 'asksTotalCounterValue');


        const bidsPriceLine = this.textBids.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        bidsPriceLine.append('tspan').text('Price: ');
        bidsPriceLine.append('tspan').style('font-weight', 'normal').attr('class', 'bidsPriceValue');

        const bidsAmountLine = this.textBids.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        bidsAmountLine.append('tspan').text('Amount: ');
        bidsAmountLine.append('tspan').style('font-weight', 'normal').attr('class', 'bidsAmountValue');

        const bidsSumLine = this.textBids.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        bidsSumLine.append('tspan').text('Sum: ');
        bidsSumLine.append('tspan').style('font-weight', 'normal').attr('class', 'bidsSumValue');

        const bidsTotalBaseLine = this.textBids.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        bidsTotalBaseLine.append('tspan').text(`Total ${this.baseBuying.code}: `);
        bidsTotalBaseLine.append('tspan').style('font-weight', 'normal').attr('class', 'bidsTotalBaseValue');

        const bidsTotalCounterLine = this.textBids.append('tspan').attr('x', 0).attr('dy', DATA_TOOLTIP_LINE_HEIGHT);
        bidsTotalCounterLine.append('tspan').text(`Total ${this.counterSelling.code}: `);
        bidsTotalCounterLine.append('tspan').style('font-weight', 'normal').attr('class', 'bidsTotalCounterValue');
    }

    _updateAxes() {
        this.scaleX.domain([
            this.bids.length ? getPriceValue(this.bids[0]) : 0,
            this.asks.length ? getPriceValue(this.asks[this.asks.length - 1]) : 0,
        ]);
        this.scaleY.domain(
            [Math.max(this.asks[this.asks.length - 1].sum, this.bids[0].sum) * AXIS_Y_INCREASE_COEFFICIENT, 0],
        );

        this.svg.selectAll('.x-axis')
            .transition()
            .duration(this.animationDuration)
            .call(this.axisX);

        this.svg.selectAll('.y-axis')
            .transition()
            .duration(this.animationDuration)
            .call(this.axisY);

        d3.selectAll('.grid-line').remove();

        d3.selectAll('g.x-axis g.tick')
            .append('line')
            .classed('grid-line', true)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', -(this.yAxisLength));

        d3.selectAll('g.y-axis g.tick')
            .append('line')
            .classed('grid-line', true)
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', this.xAxisLength)
            .attr('y2', 0);
    }
    _updateBidsLine() {
        if (!this.bids.length) {
            return;
        }

        this.bidsLine
            .transition()
            .duration(this.animationDuration)
            .attr('d', () => this._getBidsLine(this.bids));


        const dotsData = this.bids.filter(bid =>
            (bid.amount / this.bids[0].sum >= CIRCLE_THRESHOLD),
        );

        this.dotsGroup.selectAll('.bidsDots')
            .data(dotsData)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'bidsDots')
                    .attr('stroke', BIDS_LINE_COLOR)
                    .attr('stroke-width', CIRCLE_STROKE_WIDTH)
                    .attr('fill', CIRCLE_FILL)
                    .attr('r', CIRCLE_RADIUS)
                    .attr('cx', data => this.scaleX(getPriceValue(data)) + MARGIN_LEFT)
                    .attr('cy', data => this.scaleY(Number(data.sum)) + MARGIN_TOP),
                update => update
                    .transition()
                    .duration(this.animationDuration)
                    .attr('cx', data => this.scaleX(getPriceValue(data)) + MARGIN_LEFT)
                    .attr('cy', data => this.scaleY(Number(data.sum)) + MARGIN_TOP),
            );
    }

    _getBidsLine(data) {
        const lineValues = this.line(data).slice(1);
        return `M${MARGIN_LEFT},${HEIGHT - MARGIN_BOTTOM}, ${lineValues},V${HEIGHT - MARGIN_BOTTOM}`;
    }

    _updateAsksLine() {
        if (!this.asks.length) {
            return;
        }

        this.asksLine
            .transition()
            .duration(this.animationDuration)
            .attr('d', () => this._getAsksLine(this.asks));

        const dotsData = this.asks.filter(ask =>
            (getPriceValue(ask) * Number(ask.amount)) / this.asks[this.asks.length - 1].sum >= CIRCLE_THRESHOLD,
        );

        this.dotsGroup.selectAll('.asksDots')
            .data(dotsData)
            .join(
                enter => enter.append('circle')
                    .attr('class', 'asksDots')
                    .attr('stroke', ASKS_LINE_COLOR)
                    .attr('stroke-width', CIRCLE_STROKE_WIDTH)
                    .attr('fill', CIRCLE_FILL)
                    .attr('r', CIRCLE_RADIUS)
                    .attr('cx', data => this.scaleX(getPriceValue(data)) + MARGIN_LEFT)
                    .attr('cy', data => this.scaleY(Number(data.sum)) + MARGIN_TOP),
                update => update
                    .transition()
                    .duration(this.animationDuration)
                    .attr('cx', data => this.scaleX(getPriceValue(data)) + MARGIN_LEFT)
                    .attr('cy', data => this.scaleY(Number(data.sum)) + MARGIN_TOP),
            );
    }

    _getAsksLine(data) {
        const lineValues = this.line(data).slice(1);
        const splitedValues = lineValues.split(',');

        return `M${splitedValues[0]},${HEIGHT - MARGIN_BOTTOM},${lineValues},l0,${HEIGHT - MARGIN_BOTTOM - splitedValues[splitedValues.length - 1]}`;
    }

    _addMouseListeners() {
        this.svg.on('mousemove', event => {
            const [xCoord, yCoord] = d3.pointer(event);
            this.cachedPosition = [xCoord, yCoord];
            this._onMouseMove(xCoord, yCoord);
        })
            .on('mouseover', event => {
                const [xCoord, yCoord] = d3.pointer(event);
                this.cachedPosition = [xCoord, yCoord];
                this.crosshair.style('display', 'block');
                this.tooltipX.style('display', 'block');
                this.tooltipY.style('display', 'block');
            })
            .on('mouseout', event => {
                this.cachedPosition = null;
                const [xCoord] = d3.pointer(event);
                this.crosshair.style('display', 'none');
                this.tooltipX.style('display', 'none');
                this.tooltipY.style('display', 'none');

                if (xCoord >= this.svg.node().getBoundingClientRect().width) {
                    this.focusAsks.style('display', 'none');
                }
            });
    }

    _onMouseMove(xCoord, yCoord) {
        const asksNearestIndex =
            d3.bisectCenter(this.asks.map(item => getPriceValue(item)), this.scaleX.invert(xCoord - MARGIN_LEFT));
        const bidsNearestIndex =
            d3.bisectCenter(this.bids.map(item => getPriceValue(item)), this.scaleX.invert(xCoord - MARGIN_LEFT));

        if (xCoord <= MARGIN_LEFT || yCoord >= HEIGHT - MARGIN_BOTTOM || yCoord <= MARGIN_TOP) {
            this.crosshair.style('display', 'none');
            this.tooltipX.style('display', 'none');
            this.tooltipY.style('display', 'none');
            this.focusAsks.style('display', 'none');
            this.focusBids.style('display', 'none');
            return;
        }
        this._updateCrossHair(xCoord, yCoord);
        this._updateAxesTooltips(xCoord, yCoord);

        // case when the cursor is between asks and bids lines
        if (bidsNearestIndex === (this.bids.length - 1) && asksNearestIndex === 0) {
            this._addAsksTooltip(asksNearestIndex, true);
            this._addBidsTooltip(bidsNearestIndex, true);
            return;
        }

        // case when the cursor is on bids line
        if (asksNearestIndex !== 0) {
            this._addAsksTooltip(asksNearestIndex);
        } else {
            this.focusAsks.style('display', 'none');
        }

        // case when the cursor is on asks line
        if (bidsNearestIndex !== (this.bids.length - 1)) {
            this._addBidsTooltip(bidsNearestIndex);
        } else {
            this.focusBids.style('display', 'none');
        }
    }

    _updateCrossHair(xCoord, yCoord) {
        this.crosshair.style('display', 'block');
        // Update horizontal cross hair
        d3.select('#h_crosshair')
            .attr('x1', MARGIN_LEFT)
            .attr('y1', yCoord)
            .attr('x2', WIDTH)
            .attr('y2', yCoord)
            .style('display', 'block');
        // Update vertical cross hair
        d3.select('#v_crosshair')
            .attr('x1', xCoord)
            .attr('y1', MARGIN_TOP)
            .attr('x2', xCoord)
            .attr('y2', HEIGHT - MARGIN_BOTTOM)
            .style('display', 'block');
    }

    _updateAxesTooltips(xCoord, yCoord) {
        const tooltipXText = this.tooltipX.selectAll('.tooltipXText');
        const tooltipXPath = this.tooltipX.selectAll('.tooltipXPath');
        const tooltipYText = this.tooltipY.selectAll('.tooltipYText');
        const tooltipYPath = this.tooltipY.selectAll('.tooltipYPath');

        this.tooltipX.style('display', 'block').attr('x', `${xCoord}`).text();

        this.tooltipX.style('display', 'block').attr('transform', `translate(${xCoord},${HEIGHT - MARGIN_BOTTOM})`);
        tooltipXText.text(roundAndFormat(this.scaleX.invert(xCoord - MARGIN_LEFT)));
        const { width: w1, height: h1 } = tooltipXText.node().getBBox();
        tooltipXText.attr('transform', `translate(${-w1 / 2},${h1 + (AXIS_TOOLTIP_OFFSET / 2)})`);
        tooltipXPath.attr('d', getBottomTooltipPathD(w1 + AXIS_TOOLTIP_OFFSET, h1 + AXIS_TOOLTIP_OFFSET, AXIS_TOOLTIP_MARGIN, AXIS_TOOLTIP_BORDER_RADIUS, AXIS_TOOLTIP_TRIANGLE_SIZE));

        this.tooltipY.style('display', 'block').attr('transform', `translate(${MARGIN_LEFT},${yCoord})`);
        tooltipYText.text(roundAndFormat(this.scaleY.invert(yCoord - MARGIN_TOP)));
        const { width: w2, height: h2 } = tooltipYText.node().getBBox();
        tooltipYText.attr('transform', `translate(${-w2 - AXIS_TOOLTIP_OFFSET},${(h2 / 2) - (AXIS_TOOLTIP_OFFSET / 2)})`);
        tooltipYPath.attr('d', getLeftTooltipPathD(w2 + AXIS_TOOLTIP_OFFSET, h2 + AXIS_TOOLTIP_OFFSET, AXIS_TOOLTIP_MARGIN, AXIS_TOOLTIP_BORDER_RADIUS, AXIS_TOOLTIP_TRIANGLE_SIZE));
    }

    _addAsksTooltip(index, isInvert) {
        const ask = this.asks[index];
        const xCoord = this.scaleX(getPriceValue(ask)) + MARGIN_LEFT;
        const yCoord = this.scaleY(ask.sum) + MARGIN_TOP;

        this.focusAsks.style('display', 'block').attr('transform', `translate(${xCoord},${yCoord})`);
        this.textAsks.selectAll('.asksPriceValue').text(formatNumber(ask.price));
        this.textAsks.selectAll('.asksAmountValue').text(`${roundAndFormat(ask.amount)} ${this.baseBuying.code}`);
        this.textAsks.selectAll('.asksSumValue').text(`${roundAndFormat(Number(ask.price) * Number(ask.amount))} ${this.counterSelling.code}`);
        this.textAsks.selectAll('.asksTotalBaseValue').text(`${roundAndFormat(ask.sumReverse)} ${this.baseBuying.code}`);
        this.textAsks.selectAll('.asksTotalCounterValue').text(`${roundAndFormat(ask.sum)} ${this.counterSelling.code}`);

        const { width: w, height: h } = this.textAsks.node().getBBox();

        this.textAsks
            .attr('transform', isInvert ?
                `translate(${(DATA_TOOLTIP_OFFSET_X / 2) + DATA_TOOLTIP_MARGIN + DATA_TOOLTIP_TRIANGLE_SIZE},${-(h / 2) - (DATA_TOOLTIP_OFFSET_Y / 2)})` :
                `translate(${-w - ((DATA_TOOLTIP_OFFSET_X / 2) + DATA_TOOLTIP_MARGIN + DATA_TOOLTIP_TRIANGLE_SIZE)},${-(h / 2) - (DATA_TOOLTIP_OFFSET_Y / 2)})`,
            )
            .attr('fill', DATA_TOOLTIP_TEXT_COLOR);

        this.pathAsks
            .attr('d', isInvert ?
                getRightTooltipPathD(
                    w + DATA_TOOLTIP_OFFSET_X,
                    h + DATA_TOOLTIP_OFFSET_Y,
                    DATA_TOOLTIP_MARGIN,
                    DATA_TOOLTIP_BORDER_RADIUS,
                    DATA_TOOLTIP_TRIANGLE_SIZE,
                ) :
                getLeftTooltipPathD(
                    w + DATA_TOOLTIP_OFFSET_X,
                    h + DATA_TOOLTIP_OFFSET_Y,
                    DATA_TOOLTIP_MARGIN,
                    DATA_TOOLTIP_BORDER_RADIUS,
                    DATA_TOOLTIP_TRIANGLE_SIZE,
                ),
            );

        if (this.svg.node().getBoundingClientRect().right < this.pathAsks.node().getBoundingClientRect().right) {
            this.textAsks
                .attr('transform',
                    `translate(${-w - ((DATA_TOOLTIP_OFFSET_X / 2) + DATA_TOOLTIP_MARGIN + DATA_TOOLTIP_TRIANGLE_SIZE)},${-(h / 2) - (DATA_TOOLTIP_OFFSET_Y / 2)})`,
                );
            this.pathAsks
                .attr('d',
                    getLeftTooltipPathD(
                        w + DATA_TOOLTIP_OFFSET_X,
                        h + DATA_TOOLTIP_OFFSET_Y,
                        DATA_TOOLTIP_MARGIN,
                        DATA_TOOLTIP_BORDER_RADIUS,
                        DATA_TOOLTIP_TRIANGLE_SIZE,
                    ),
                );
        }
    }

    _addBidsTooltip(index, isInvert) {
        const bid = this.bids[index];
        const xCoord = this.scaleX(getPriceValue(bid)) + MARGIN_LEFT;
        const yCoord = this.scaleY(bid.sum) + MARGIN_TOP;

        this.focusBids.style('display', 'block').attr('transform', `translate(${xCoord},${yCoord})`);

        this.textBids.selectAll('.bidsPriceValue').text(formatNumber(bid.price));
        this.textBids.selectAll('.bidsAmountValue').text(`${roundAndFormat(bid.amount / bid.price)} ${this.baseBuying.code}`);
        this.textBids.selectAll('.bidsSumValue').text(`${roundAndFormat(Number(bid.amount))} ${this.counterSelling.code}`);
        this.textBids.selectAll('.bidsTotalBaseValue').text(`${roundAndFormat(bid.sumReverse)} ${this.baseBuying.code}`);
        this.textBids.selectAll('.bidsTotalCounterValue').text(`${roundAndFormat(bid.sum)} ${this.counterSelling.code}`);


        const { width: w, height: h } = this.textBids.node().getBBox();

        this.textBids
            .attr('transform', isInvert ?
                `translate(${-w - ((DATA_TOOLTIP_OFFSET_X / 2) + DATA_TOOLTIP_MARGIN + DATA_TOOLTIP_TRIANGLE_SIZE)},${-(h / 2) - (DATA_TOOLTIP_OFFSET_Y / 2)})` :
                `translate(${(DATA_TOOLTIP_OFFSET_X / 2) + DATA_TOOLTIP_MARGIN + DATA_TOOLTIP_TRIANGLE_SIZE},${-(h / 2) - (DATA_TOOLTIP_OFFSET_Y / 2)})`)
            .attr('fill', DATA_TOOLTIP_TEXT_COLOR);

        this.pathBids.attr('d',
            isInvert ?
                getLeftTooltipPathD(
                    w + DATA_TOOLTIP_OFFSET_X,
                    h + DATA_TOOLTIP_OFFSET_Y,
                    DATA_TOOLTIP_MARGIN,
                    DATA_TOOLTIP_BORDER_RADIUS,
                    DATA_TOOLTIP_TRIANGLE_SIZE,
                ) :
                getRightTooltipPathD(
                    w + DATA_TOOLTIP_OFFSET_X,
                    h + DATA_TOOLTIP_OFFSET_Y,
                    DATA_TOOLTIP_MARGIN,
                    DATA_TOOLTIP_BORDER_RADIUS,
                    DATA_TOOLTIP_TRIANGLE_SIZE,
                ),
        );

        if (this.svg.node().getBoundingClientRect().left > this.pathBids.node().getBoundingClientRect().left) {
            this.textBids
                .attr('transform',
                    `translate(${(DATA_TOOLTIP_OFFSET_X / 2) + DATA_TOOLTIP_MARGIN + DATA_TOOLTIP_TRIANGLE_SIZE},${-(h / 2) - (DATA_TOOLTIP_OFFSET_Y / 2)})`,
                );
            this.pathBids
                .attr('d',
                    getRightTooltipPathD(
                        w + DATA_TOOLTIP_OFFSET_X,
                        h + DATA_TOOLTIP_OFFSET_Y,
                        DATA_TOOLTIP_MARGIN,
                        DATA_TOOLTIP_BORDER_RADIUS,
                        DATA_TOOLTIP_TRIANGLE_SIZE,
                    ),
                );
        }
    }
}
