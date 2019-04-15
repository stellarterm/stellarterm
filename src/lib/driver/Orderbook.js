import MagicSpoon from '../MagicSpoon';
import Event from '../Event';

export default function Orderbook(driver) {
    this.event = new Event();

    this.data = {
        ready: false,
    };

    this.handlers = {
        pickPrice: (price) => {
            this.event.trigger({
                pickPrice: price,
            });
        },

        setOrderbook: (baseBuying, counterSelling) => {
            // If orderbook is already set, then this is a no-op
            // Expects baseBuying and counterSelling to StellarSdk.Asset objects
            const dataIsValid =
                this.data.ready &&
                this.data.baseBuying.equals(baseBuying) &&
                this.data.counterSelling.equals(counterSelling);

            if (dataIsValid) {
                return;
            } else if (this.data.close) {
                this.data.close();
            }

            this.data = new MagicSpoon.Orderbook(driver.Server, baseBuying, counterSelling, () => {
                this.event.trigger();
                driver.session.forceUpdateAccountOffers();
            });
        },
    };
}
