import Event from '../../helpers/Event';
import MagicSpoon from '../../helpers/MagicSpoon';


export const TRADES_EVENTS = {
    INITIAL_LOAD: 'INITIAL_LOAD',
    STREAM_UPDATE: 'STREAM_UPDATE',
};


export default class Trades {
    constructor(driver) {
        this.driver = driver;

        this.event = new Event();

        this.ready = false;
    }

    setPair(base, counter) {
        if (this.ready && this.base && this.counter && this.base.equals(base) && this.counter.equals(counter)) {
            return;
        }

        this.stopStream();

        this.base = base;
        this.counter = counter;

        this.getTradesForPair();
    }

    getTradesForPair(limit) {
        return this.driver.Server.trades()
            .forAssetPair(this.base, this.counter)
            .limit(limit || 100)
            .order('desc')
            .call()
            .then(res => {
                this.tradesHistory = res.records;
                this.ready = true;
                this.event.trigger({ type: TRADES_EVENTS.INITIAL_LOAD, trades: this.tradesHistory });

                this.startStream();
            })
            .catch(error => {
                console.log(error);
            });
    }

    startStream() {
        this.closeLastTradesStream = this.driver.Server.trades()
            .forAssetPair(this.base, this.counter)
            .order('asc')
            .cursor('now')
            .stream({
                onmessage: trade => {
                    this.tradesHistory = [trade, ...this.tradesHistory].slice(0, 200);
                    this.event.trigger({ type: TRADES_EVENTS.STREAM_UPDATE, trades: this.tradesHistory });
                },
            });
    }

    stopStream() {
        if (this.closeLastTradesStream) {
            this.closeLastTradesStream();
        }

        this.tradesHistory = null;
        this.ready = false;
    }

    getTrades(START_DATE, END_DATE, RESOLUTION, LIMIT) {
        if (!this.base || !this.counter) {
            throw new Error('Pair not settled');
        }
        return MagicSpoon.tradeAggregation(
            this.driver.Server,
            this.base,
            this.counter,
            START_DATE,
            END_DATE,
            RESOLUTION,
            LIMIT,
        );
    }


    getLastMinuteAggregation() {
        return MagicSpoon.getLastMinuteAggregation(this.driver.Server, this.base, this.counter);
    }


    getLast24hAggregationsWithStep15min() {
        return MagicSpoon.getLast24hAggregationsWithStep15min(this.driver.Server, this.base, this.counter);
    }
}
