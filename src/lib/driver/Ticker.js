import req from '../req';
import Event from '../Event';
import * as EnvConsts from '../../env-consts';

const MAX_ATTEMPTS = 120;

export default class Ticker {

    constructor() {
        this.event = new Event();

        this.ready = false;
        this.data = {};

        this.load();
    }

    load(attempt) {
        if (attempt >= MAX_ATTEMPTS) {
            return Promise.reject();
        }

        return req.getJson(EnvConsts.API_URL)
            .then((tickerData) => {
                this.ready = true;
                this.data = tickerData;
                console.log(`Loaded ticker. Data generated ${Math.round((new Date() - (this.data._meta.start * 1000)) / 1000)} seconds ago.`);

                this.event.trigger();
                setTimeout(() => this.load(), 61 * 5 * 1000); // Refresh every 5 minutes
            })
            .catch((error) => {
                console.log('Unable to load ticker', error);
                const nextAttempt = (attempt || 0) + 1;
                setTimeout(() => this.load(nextAttempt), 1000);
            });
    }
}
