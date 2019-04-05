import req from './req';
import Event from '../Event';
import * as EnvConsts from '../../env-consts';

const MAX_ATTEMPTS = 120;
const API_DATA = 'ticker.json';
const API_FEE_DATA = 'feeData.json';

export default class Ticker {

    constructor() {
        this.event = new Event();

        this.ready = false;
        this.data = {};
        this.feeValue = null;

        this.load();
        this.loadFeeData();
    }

    load() {
        return this.loadWithAttempts(() => req
            .getJson(`${EnvConsts.API_URL}${API_DATA}`)
            .then((tickerData) => {
                this.ready = true;
                this.data = tickerData;
                console.log(`Loaded ticker. Data generated ${Math.round((new Date() - (this.data._meta.start * 1000)) / 1000)} seconds ago.`);

                this.event.trigger();
                setTimeout(() => this.load(), 61 * 5 * 1000); // Refresh every 5 minutes
            }), 'Unable to load ticker');
    }

    loadWithAttempts(promiseFunction, message = 'Error', attempt) {
        if (attempt >= MAX_ATTEMPTS) {
            return Promise.reject();
        }

        return promiseFunction()
            .catch((error) => {
                console.log(message, error);
                const nextAttempt = (attempt || 0) + 1;
                setTimeout(() => this.loadWithAttempts(promiseFunction, message, nextAttempt), 1000);
            });
    }

    loadFeeData() {
        return this.loadWithAttempts(() => req
            .getJson(`${EnvConsts.API_URL}${API_FEE_DATA}`)
            .then((feeData) => {
                this.feeValue = feeData.fee_value;
                this.event.triggerSpecial('fee-changed', this.feeValue);
                setTimeout(() => this.loadFeeData(), 61 * 1000); // Refresh every 1 minutes
            }), 'Unable to load fee stats');
    }
}
