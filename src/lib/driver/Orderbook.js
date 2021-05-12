import MagicSpoon from '../MagicSpoon';
import Event from '../Event';

export default class Orderbook {
    constructor(driver) {
        this.event = new Event();
        this.data = {
            ready: false,
        };

        let base;
        let counter;

        this.handlers = {
            pickPrice: price => {
                this.event.trigger({
                    pickPrice: price,
                });
            },
            setOrderbook: (baseBuying, counterSelling) => {
                this.event.trigger();
                // If orderbook is already set, then this is a no-op
                // Expects baseBuying and counterSelling to StellarSdk.Asset objects
                base = baseBuying;
                counter = counterSelling;

                if (this.data.ready && this.data.baseBuying.equals(base) && this.data.counterSelling.equals(counter)) {
                    return;
                }

                this.data = new MagicSpoon.Orderbook(driver.Server, base, counter, () => {
                    this.event.trigger();
                    driver.session.forceUpdateAccountOffers();
                });
            },
            getTrades: (START_DATE, END_DATE, RESOLUTION, LIMIT) =>
                MagicSpoon.tradeAggregation(driver.Server, base, counter, START_DATE, END_DATE, RESOLUTION, LIMIT),
        };
    }
}
