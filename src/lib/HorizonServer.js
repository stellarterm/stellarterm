import * as StellarSdk from 'stellar-sdk';
import Event from './Event';
import { get } from './api/request';
import { SESSION_STATE } from './constants';


export const HORIZON_SERVER_EVENTS = {
    horizonChanged: 'horizon changed',
    newHorizonAdded: 'new horizon added',
};


const DEFAULT_SERVERS = {
    lobstr: { name: 'LOBSTR horizon', url: 'https://horizon.stellar.lobstr.co' },
    stellar: { name: 'Stellar horizon', url: 'https://horizon.stellar.org' },
};

const CUSTOM_HORIZON_SERVERS_LIST_LS = 'customHorizonServersList';
const ACTIVE_HORIZON_SERVER = 'activeHorizonServer';

const TRANSACTION_TIMEOUT = 60 * 60 * 24 * 30;


export default class HorizonServer {
    constructor(driver) {
        this.driver = driver;

        this.event = new Event();

        this.customServers = JSON.parse(localStorage.getItem(CUSTOM_HORIZON_SERVERS_LIST_LS) || 'null') || [];
        this.activeServer = localStorage.getItem(ACTIVE_HORIZON_SERVER) || DEFAULT_SERVERS.lobstr.url;

        this.startServer();
    }

    get serverList() {
        return [...Object.values(DEFAULT_SERVERS), ...this.customServers];
    }

    /**
     * Check if the url is a valid horizon server
     * @param url {string} - horizon url
     * @returns Promise {string} - return horizon url if valid
     */
    checkHorizonServer(url) {
        const HTTPS = 'https://';
        const HTTP = 'http://';

        return new Promise(async (resolve, reject) => {
            let trimmedUrl = url.trim();

            if (trimmedUrl.startsWith(HTTP)) {
                reject('Insecure Horizon server. Horizon address must start with https://');
            }

            if (!trimmedUrl.startsWith(HTTPS)) {
                reject('Invalid Horizon address');
            }

            trimmedUrl = `${HTTPS}${trimmedUrl.slice(HTTPS.length)
                .replace(/^[\\\\/]+|[\\\\/]+$/g, '')}`;

            try {
                const serverInfo = await get(trimmedUrl);
                const isValid = serverInfo.network_passphrase === StellarSdk.Networks.PUBLIC;

                if (!isValid) {
                    reject('Invalid Horizon address');
                }

                if (this.serverList.find(server => server.url === trimmedUrl)) {
                    reject('This Horizon already exists');
                }

                resolve(trimmedUrl);
            } catch (e) {
                console.log(e);
                reject('Invalid Horizon address');
            }
        });
    }

    addCustomServer(customUrl) {
        return this.checkHorizonServer(customUrl)
            .then(url => {
                this.customServers.push({ name: '', url });
                localStorage.setItem(CUSTOM_HORIZON_SERVERS_LIST_LS, JSON.stringify(this.customServers));

                this.event.trigger(HORIZON_SERVER_EVENTS.newHorizonAdded);
            })
            .catch(error => {
                throw new Error(error);
            });
    }


    /**
     * Get initial horizon config
     * @returns {
     * {
     *  horizonUrl: string,
     *  isDefault: boolean,
     *  isCustom: boolean,
     *  isTestnet: boolean,
     *  networkPassphrase: StellarSdk.Networks
     * }
     * }
     */
    getInitialHorizonConfig() {
        const network = {
            horizonUrl: this.activeServer,
            networkPassphrase: StellarSdk.Networks.PUBLIC,
            isDefault: true, // If it's default, then we don't show a notice bar at the top
            isTestnet: false,
            isCustom: false,
        };

        const TESTNET_URL = '/testnet';

        if (window.location.pathname.includes(TESTNET_URL)) {
            network.isDefault = false;
            network.isTestnet = true;
            network.horizonUrl = 'https://horizon-testnet.stellar.org';
            network.networkPassphrase = StellarSdk.Networks.TESTNET;

            const reg = new RegExp(`(.+)${TESTNET_URL}$`);
            window.history.replaceState({}, '', window.location.pathname.replace(reg, '$1'));
        } else if (window.stCustomConfig.horizonUrl) {
            network.isDefault = false;
            network.isCustom = true;
            network.horizonUrl = window.stCustomConfig.horizonUrl;
            if (window.stCustomConfig.networkPassphrase) {
                network.networkPassphrase = window.stCustomConfig.networkPassphrase;
            }
        }

        return network;
    }

    /**
     * Initial start horizon server
     * @returns {void}
     */
    startServer() {
        const networkConfig = this.getInitialHorizonConfig();

        this.driver.Server = new StellarSdk.Server(networkConfig.horizonUrl);
        this.driver.Server.currentServerUrl = networkConfig.horizonUrl;
        this.driver.Server.transactionTimeout = TRANSACTION_TIMEOUT;
        this.driver.Server.networkPassphrase = networkConfig.networkPassphrase;
        this.driver.Server.isTestnet = networkConfig.isTestnet;
        this.driver.Server.isDefault = networkConfig.isDefault;
    }

    /**
     * Change the horizon server. If the streams are running then restart them
     * @param url - horizon url
     * @returns {void}
     */
    changeHorizon(url) {
        if (
            url === this.driver.Server.currentServerUrl ||
            !this.driver.accountEvents.streamInitialized ||
            !window.navigator.onLine
        ) {
            return;
        }
        this.driver.Server = new StellarSdk.Server(url);
        this.driver.Server.currentServerUrl = url;
        this.driver.Server.transactionTimeout = TRANSACTION_TIMEOUT;
        // we can change horizon only to pubnet currently
        this.driver.Server.networkPassphrase = StellarSdk.Networks.PUBLIC;
        this.driver.Server.isTestnet = false;
        this.driver.Server.isDefault = true;

        if (this.driver.session.state === SESSION_STATE.IN) {
            this.driver.session.account.restartAccountStream(this.driver.Server);

            this.driver.accountEvents.restartAccountEventsListening(
                this.driver.Server,
                this.driver.session.account.account_id,
            );
        }

        if (this.driver.orderbook.data.ready) {
            this.driver.orderbook.handlers.stopOrderbook();
            this.driver.orderbook.handlers.stopLastTradesStream();
        }

        localStorage.setItem(ACTIVE_HORIZON_SERVER, url);
        this.activeServer = url;

        this.event.trigger(HORIZON_SERVER_EVENTS.horizonChanged);
    }
}
