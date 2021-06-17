import * as StellarSdk from 'stellar-sdk';
import Event from './Event';
import { get } from './api/request';


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
    /**
     * Check if the url is a valid horizon server
     * @param url {string} - horizon url
     * @returns {boolean} - is a valid horizon
     */
    static async checkHorizonServer(url) {
        try {
            const serverInfo = await get(url);
            return serverInfo.network_passphrase === StellarSdk.Networks.PUBLIC;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

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

    async addCustomServer(url) {
        const isValid = await this.constructor.checkHorizonServer(url);

        if (!isValid) {
            throw new Error('Invalid horizon address');
        }

        if (this.serverList.find(server => server.url === url || `${server.url}/` === url || server.url === `${url}/`)) {
            throw new Error('This horizon already exists');
        }

        this.customServers.push({ name: '', url });
        localStorage.setItem(CUSTOM_HORIZON_SERVERS_LIST_LS, JSON.stringify(this.customServers));

        this.event.trigger(HORIZON_SERVER_EVENTS.newHorizonAdded);
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
        if (url === this.driver.Server.currentServerUrl) {
            return;
        }
        this.driver.Server = new StellarSdk.Server(url);
        this.driver.Server.currentServerUrl = url;
        this.driver.Server.transactionTimeout = TRANSACTION_TIMEOUT;
        // we can change horizon only to pubnet currently
        this.driver.Server.networkPassphrase = StellarSdk.Networks.PUBLIC;
        this.driver.Server.isTestnet = false;
        this.driver.Server.isDefault = true;

        if (this.driver.session.state === 'in') {
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
