import directory from 'stellarterm-directory';
import req from './req';
import Event from '../Event';
import * as EnvConsts from '../../env-consts';
import { post } from './request';
import { getEndpoint } from './endpoints';

const MAX_ATTEMPTS = 120;
const API_DATA = 'ticker.json';

export default class Ticker {
    constructor() {
        this.event = new Event();

        this.ready = false;
        this.data = {};
        this.feeValue = null;

        this.load();
    }

    load() {
        return this.loadWithAttempts(() => req
            .getJson(`${EnvConsts.API_URL}${API_DATA}`)
            .then((tickerData) => {
                this.ready = true;
                this.data = tickerData;
                const tickerDirectoryBuild = this.data._meta.directoryBuild;
                const frontendDirectoryBuild = directory.getBuildId();

                if (tickerDirectoryBuild !== frontendDirectoryBuild) {
                    console.warn(`${'Stellarterm-directory versions conflict! ' +
                        'Please, check stellarterm-directory builds in stellarterm frontend application and ' +
                        'stellarterm-api.\nCurrent versions: \n    stellarterm - '}${frontendDirectoryBuild
                    }, \n    stellarterm-api - ${tickerDirectoryBuild}`);
                }

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
    static loadStellarMarketsData(baseAssetCode, baseAssetIssuer, numHoursAgo) {
        const headers = { 'Content-Type': 'application/json' };
        const stellarTickerGraphQLParams = `{ markets(
            numHoursAgo: ${numHoursAgo}, 
            baseAssetCode: "${baseAssetCode}", 
            baseAssetIssuer: "${baseAssetIssuer}") ` +
            '{ ' +
            'tradePair ' +
            'baseVolume ' +
            'change ' +
            'close ' +
            'open ' +
            'counterAssetCode ' +
            'counterAssetIssuer} }';

        const body = JSON.stringify({ query: stellarTickerGraphQLParams });
        return post(getEndpoint('stellarTickerGraphQL'), { headers, body });
    }
}
