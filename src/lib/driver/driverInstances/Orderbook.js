import BigNumber from 'bignumber.js';
import Event from '../../helpers/Event';
import {
    ORDERBOOK_EVENTS,
    ORDERBOOK_LIST_SIZE,
    ORDERBOOK_MAX_DEPTH_PERCENT,
    ORDERBOOK_PRECISION,
} from '../../constants/orderbookContants';

export default class Orderbook {
    constructor(driver) {
        this.driver = driver;

        this.event = new Event();

        this.data = {
            ready: false,
        };

        this.zoomCounter = 0;
    }

    get zoomedAsks() {
        return Orderbook._processOrderbook(this.data.asks, true, this.zoomValue);
    }

    get zoomedBids() {
        return Orderbook._processOrderbook(this.data.bids, false, this.zoomValue);
    }

    get zoomValue() {
        return this._getZoomValue();
    }

    get maxDepth() {
        return this._getMaxDepth();
    }

    increaseZoom() {
        this.zoomCounter = this.zoomCounter + 1;
        this.event.trigger({ type: ORDERBOOK_EVENTS.ZOOM_UPDATE });
    }

    decreaseZoom() {
        if (this.zoomCounter !== 0) {
            this.zoomCounter = this.zoomCounter - 1;
            this.event.trigger({ type: ORDERBOOK_EVENTS.ZOOM_UPDATE });
        }
    }

    pickPrice(price) {
        this.event.trigger({
            type: ORDERBOOK_EVENTS.PICK_PRICE,
            pickPrice: price,
        });
    }
    setOrderbook(base, counter) {
        this.event.trigger({
            type: ORDERBOOK_EVENTS.LOAD,
        });
        // If orderbook is already set, then this is a no-op
        // Expects baseBuying and counterSelling to StellarSdk.Asset objects
        if (this.data.ready && this.data.baseBuying.equals(base) && this.data.counterSelling.equals(counter)) {
            return;
        }

        this.stopOrderbook();

        this._resetZoom();

        this.data.baseBuying = base;
        this.data.counterSelling = counter;

        this.getOrderbook();
    }

    stopOrderbook() {
        this.data.ready = false;

        if (this.closeOrderbookStream) {
            this.closeOrderbookStream();
        }
    }

    getOrderbook() {
        this.ready = false;
        // Initial orderbook load
        this.driver.Server.orderbook(this.data.baseBuying, this.data.counterSelling)
            .limit(200)
            .call()
            .then(orderbook => {
                this.data.asks = Orderbook._processOrderbook(orderbook.asks, true, 0);
                this.data.bids = Orderbook._processOrderbook(orderbook.bids, false, 0);

                this.data.ready = true;

                this.event.trigger({
                    type: ORDERBOOK_EVENTS.DATA_LOADED,
                });
                this.driver.session.forceUpdateAccountOffers();

                this.startStream();
            });
    }

    startStream() {
        this.closeOrderbookStream = this.driver.Server
            .orderbook(this.data.baseBuying, this.data.counterSelling)
            .limit(200)
            .stream({
                onmessage: orderbook => {
                    this.data.asks = Orderbook._processOrderbook(orderbook.asks, true, 0);
                    this.data.bids = Orderbook._processOrderbook(orderbook.bids, false, 0);

                    this.event.trigger({
                        type: ORDERBOOK_EVENTS.DATA_UPDATED,
                    });
                    this.driver.session.forceUpdateAccountOffers();
                },
            });
    }

    /**
     * Round price to zoom level
     * @param price {BigNumber} - BigNumber price
     * @param zoomLevel {number} - orderbook zoom level
     * @param isAsk {boolean} - is ask price
     * @return {BigNumber} - rounded price
     * @private
     */
    static _roundPrice(price, zoomLevel, isAsk) {
        if (!Number(zoomLevel)) {
            return price;
        }

        const diff = price.mod(zoomLevel);

        if (isAsk) {
            return diff.eq(0) ? price : price.minus(diff).plus(zoomLevel);
        }

        return price.minus(diff);
    }

    /**
     * Calculate additional parameters for the orderbook, group the orderbook depending on zoom level
     * @param orderbook {{ price: string, amount: string; price_r: { n: number, d: number}}[]} asks or bids array
     * @param isAsks {boolean} - is asks or bids
     * @param zoomLevel {number} - zoom level
     * @return {{
        price: string,
        amount: string,
        amountReverse: string,
        sum: string,
        sumReverse: string,
        price_r: { n: number, d: number},
        key: string}[]
        } - processed orderbook
     * @private
     */
    static _processOrderbook(orderbook, isAsks, zoomLevel) {
        const data = orderbook.reduce((acc, order, index) => {
            const { price, amount, price_r: priceR } = order;

            const bnPrice = new BigNumber(price);
            const bnAmount = new BigNumber(amount);

            const roundedPrice = Orderbook._roundPrice(bnPrice, zoomLevel || 0, isAsks);

            if (roundedPrice.eq(0)) {
                return acc;
            }

            acc.sum = acc.sum.plus(isAsks ? bnPrice.times(bnAmount) : bnAmount);
            acc.sumReverse = acc.sumReverse.plus(isAsks ? bnAmount : bnAmount.div(bnPrice));

            const amountReverse = isAsks ? bnPrice.times(bnAmount) : bnAmount.div(bnPrice);

            const previousOrder = acc.orderbook[acc.orderbook.length - 1];

            if (!previousOrder || previousOrder.price !== roundedPrice.toFixed(ORDERBOOK_PRECISION)) {
                acc.orderbook.push({
                    price: roundedPrice.toFixed(ORDERBOOK_PRECISION),
                    amount: bnAmount.toFixed(ORDERBOOK_PRECISION),
                    amountReverse: amountReverse.toFixed(ORDERBOOK_PRECISION),
                    sum: acc.sum.toFixed(ORDERBOOK_PRECISION),
                    sumReverse: acc.sumReverse.toFixed(7),
                    price_r: priceR,
                    key: `${index}-${amount}-${price}`,
                });

                return acc;
            }

            previousOrder.amount = bnAmount.plus(new BigNumber(previousOrder.amount)).toFixed(ORDERBOOK_PRECISION);
            previousOrder.amountReverse = amountReverse
                .plus(new BigNumber(previousOrder.amountReverse)).toFixed(ORDERBOOK_PRECISION);
            previousOrder.sum = acc.sum.toFixed(ORDERBOOK_PRECISION);
            previousOrder.sumReverse = acc.sumReverse.toFixed(ORDERBOOK_PRECISION);

            return acc;
        }, {
            orderbook: [],
            sum: new BigNumber(0),
            sumReverse: new BigNumber(0),
        });

        return data.orderbook;
    }

    /**
     * Get maximum depth of orderbook
     * @return {BigNumber} - maximum depth
     * @private
     */
    _getMaxDepth() {
        const cappedDepthAsks = this.zoomedAsks
            .slice(0, ORDERBOOK_LIST_SIZE)
            .reverse()
            .find(ask => Number(ask.price) / Number(this.zoomedAsks[0].price) < ORDERBOOK_MAX_DEPTH_PERCENT);

        const cappedDepthBids = this.zoomedBids
            .slice(0, ORDERBOOK_LIST_SIZE)
            .reverse()
            .find(bid => Number(this.zoomedBids[0].price) / Number(bid.price) < ORDERBOOK_MAX_DEPTH_PERCENT);

        return BigNumber.max(
            cappedDepthAsks ? cappedDepthAsks.sum : 0,
            cappedDepthBids ? cappedDepthBids.sum : 0,
        );
    }

    /**
     * Calculate current zoom level
     * @return {number} zoom level
     * @private
     */
    _getZoomValue() {
        if (!this.data.bids.length || !this.zoomCounter) {
            return 0;
        }
        const ZOOM_BASIS = [1, 2.5, 5];

        const zoomBasis = ZOOM_BASIS[((this.zoomCounter - 1) % ZOOM_BASIS.length)];

        const zoomMultiplier = new BigNumber(10).pow(Math.trunc((this.zoomCounter - 1) / ZOOM_BASIS.length));

        const bestBidPrice = this.data.bids[0].price;

        const integerDigitsCount = bestBidPrice.split('.')[0].length;

        const priceMultiplier = new BigNumber(10).pow(integerDigitsCount - ORDERBOOK_PRECISION);

        return new BigNumber(zoomBasis).times(zoomMultiplier).times(priceMultiplier).toNumber();
    }

    _resetZoom() {
        this.zoomCounter = 0;
    }
}
