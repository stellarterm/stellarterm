import directory from 'stellarterm-directory';
import req from './req';
import Event from '../Event';
import * as EnvConsts from '../../env-consts';
import { postWithCancel } from './request';
import { getEndpoint } from './endpoints';

const MAX_ATTEMPTS = 120;
const API_DATA = 'ticker.json';
const DATA_URL = EnvConsts.ANCHORS_URL.startsWith('/') ? `${window.location.origin}${EnvConsts.ANCHORS_URL}` : EnvConsts.ANCHORS_URL;

export default class Ticker {
    constructor() {
        this.event = new Event();

        this.ready = false;
        this.data = {};
        this.feeValue = null;

        this.load();
    }

    load() {
        return directory.initialize(DATA_URL)
            .then(() => this.loadWithAttempts(() => req
                .getJson(`${EnvConsts.API_URL}${API_DATA}`)
                .then((tickerData) => {
                    this.ready = true;
                    this.data = tickerData;

                    console.log(`Loaded ticker. Data generated ${Math.round((new Date() - (this.data._meta.start * 1000)) / 1000)} seconds ago.`);

                    this.event.trigger();
                    setTimeout(() => this.load(), 61 * 5 * 1000); // Refresh every 5 minutes
                }), 'Unable to load ticker'));
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

    static loadStellarMarketsData({
                                      baseAssetCode, baseAssetIssuer, numHoursAgo, counterAssetCode, counterAssetIssuer, isTestnet,
                                  }) {
        const headers = { 'Content-Type': 'application/json' };
        const stellarTickerGraphQLParams =
            `{ markets(
            ${numHoursAgo ? `numHoursAgo: ${numHoursAgo},` : ''}
            ${counterAssetCode ? `counterAssetCode: "${counterAssetCode}",` : ''}
            ${counterAssetIssuer ? `counterAssetIssuer: "${counterAssetIssuer}",` : ''}
            ${baseAssetCode ? `baseAssetCode: "${baseAssetCode}",` : ''}
            ${baseAssetIssuer ? `baseAssetIssuer: "${baseAssetIssuer}"` : ''}) { ` +
            'tradePair ' +
            'baseVolume ' +
            'counterVolume ' +
            'change ' +
            'close ' +
            'open ' +
            'baseAssetCode ' +
            'baseAssetIssuer ' +
            'counterAssetCode ' +
            'counterAssetIssuer} }';

        const body = JSON.stringify({ query: stellarTickerGraphQLParams });
        return postWithCancel(getEndpoint(isTestnet ? 'stellarTestnetTickerGraphQL' : 'stellarTickerGraphQL'), { headers, body });
    }
}
