import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client';
import * as StellarSdk from 'stellar-sdk';
import { AUTH_TYPE, TX_STATUS } from '../constants';
import Sep7Handler from '../../components/HomePage/Sep7Handler/Sep7Handler';


const METADATA = {
    name: 'StellarTerm',
    description: 'StellarTerm is an advanced web-based trading client for the Stellar network. ' +
        'Send, receive, and trade assets on the Stellar network easily with StellarTerm.',
    url: 'https://stellarterm.com',
    icons: ['https://avatars.githubusercontent.com/u/25021964?s=200&v=4.png'],
};

const STELLAR_METHODS = {
    SIGN: 'stellar_signAndSubmitXDR',
};
const TESTNET = 'stellar:testnet';
const PUBNET = 'stellar:pubnet';

export default class WalletConnectService {
    constructor(driver) {
        this.driver = driver;
        this.appMeta = null;
        this.client = null;
        this.session = null;

        this.isPairCreated = false;
    }

    async initWalletConnect() {
        if (this.client) {
            return null;
        }
        this.client = await WalletConnectClient.init({
            // logger: 'debug',
            relayProvider: 'wss://relay.walletconnect.org',
        });

        // there is a problem with updating the states in wallet connect, a small timeout solves this problem
        // TODO delete this when it is fixed in the library
        await new Promise(resolve => { setTimeout(() => resolve(), 500); });

        this.listenWalletConnectEvents();

        if (!this.client.session.topics.length) {
            return null;
        }

        this.session =
            await this.client.session.get(this.client.session.topics[0]);

        // eslint-disable-next-line no-unused-vars
        const [chain, reference, publicKey] = this.session.state.accounts[0].split(':');
        this.appMeta = this.session.peer.metadata;
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);

        await this.driver.session.handlers.logIn(keypair, {
            authType: AUTH_TYPE.WALLET_CONNECT,
        });

        return 'logged';
    }

    listenWalletConnectEvents() {
        this.client.on(CLIENT_EVENTS.pairing.created, res => this.onPairCreated(res));

        this.client.on(CLIENT_EVENTS.pairing.updated, res => this.onPairUpdated(res));

        this.client.on(CLIENT_EVENTS.session.deleted, session => this.onSessionDeleted(session));

        this.client.on(CLIENT_EVENTS.pairing.proposal, proposal => this.onPairProposal(proposal));
    }

    async onPairCreated(res) {
        this.appMeta = res.state.metadata;
        this.isPairCreated = true;
    }

    onPairUpdated(res) {
        this.appMeta = res.state.metadata;

        if (this.isPairCreated) {
            this.isPairCreated = false;

            this.driver.modal.handlers.finish();

            this.driver.modal.handlers.activate('WalletConnectSessionRequestModal', {
                title: this.appMeta.name,
                logo: this.appMeta.icons[0],
            });
        }
    }

    onSessionDeleted(session) {
        if (this.session && this.session.topic === session.topic) {
            this.session = null;
            this.appMeta = null;
            this.driver.session.handlers.handleLogout();
        }
    }

    async onPairProposal(proposal) {
        const { uri } = proposal.signal.params;

        const { status } = await this.driver.modal.handlers.activate('WalletConnectQRModal', uri);

        if (status === 'cancel') {
            await this.client.pairing.pending.update(proposal.topic, {
                outcome: {
                    reason: { message: 'cancelled' },
                },
                status: 'responded',
            });
            await this.client.crypto.keychain.del(proposal.proposer.publicKey);
        }
    }

    async login() {
        const result = await this.initWalletConnect();

        if (result === 'logged') {
            return;
        }

        if (this.driver.modal.modalName) {
            this.driver.modal.handlers.cancel();
        }

        if (this.client.pairing.topics.length > 3) {
            const deletePromises = [];
            this.client.pairing.topics.slice(0, -3).forEach(topic => {
                deletePromises.push(this.client.pairing.delete({ topic }));
            });

            await Promise.all(deletePromises);
        }

        if (this.client.pairing.topics.length) {
            this.driver.modal.handlers.activate('WalletConnectPairingModal', {
                pairings: this.client.pairing.values.reverse(),
                connect: this.connect.bind(this),
                deletePairing: this.deletePairing.bind(this),
            });
            return;
        }

        await this.connect();
    }

    async deletePairing(topic) {
        await this.client.pairing.delete({ topic });
    }

    async connect(pairing) {
        if (this.driver.modal.modalName === 'WalletConnectPairingModal') {
            this.driver.modal.handlers.finish();
        }
        if (pairing) {
            this.driver.modal.handlers.activate('WalletConnectSessionRequestModal', {
                title: pairing.state.metadata.name,
                logo: pairing.state.metadata.icons[0],
            });
        }

        try {
            this.session = await this.client.connect({
                metadata: METADATA,
                pairing: pairing ? { topic: pairing.topic } : undefined,
                permissions: {
                    blockchain: {
                        chains: [this.driver.Server.isTestnet ? TESTNET : PUBNET],
                    },
                    jsonrpc: {
                        methods: Object.values(STELLAR_METHODS),
                    },
                },
            });
        } catch (e) {
            if (this.session) {
                return Promise.resolve({ status: 'cancel' });
            }
            this.appMeta = null;
            if (e.message === 'cancelled') {
                return Promise.resolve({ status: 'cancel' });
            }
            const errorMessage = e.message === 'Session not approved' ?
                'Connection canceled by the user' :
                e.message;
            this.driver.toastService.error('Connection unsuccessful', errorMessage);
            return this.driver.modal.handlers.cancel();
        }

        this.driver.modal.handlers.cancel();
        this.appMeta = this.session.peer.metadata;

        // eslint-disable-next-line no-unused-vars
        const [chain, reference, publicKey] = this.session.state.accounts[0].split(':');
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
        return this.driver.session.handlers.logIn(keypair, {
            authType: AUTH_TYPE.WALLET_CONNECT,
        }).then(() => {
            Sep7Handler(this.driver);

            if (pairing) {
                this.client.pairing.settled.update(pairing.topic, {
                    state: {
                        metadata: this.appMeta,
                    },
                });
            }
        });
    }

    async logout() {
        if (this.session) {
            await this.client.disconnect({
                topic: this.session.topic,
                reason: 'log out',
            });
        }
    }

    signTx(tx) {
        if (this.driver.modal.modalName) {
            this.driver.modal.handlers.finish();
        }

        const xdr = tx.toEnvelope().toXDR('base64');

        this.driver.modal.handlers.activate('WalletConnectRequestModal', {
            title: this.appMeta.name,
            logo: this.appMeta.icons[0],
            result: this.client.request({
                topic: this.session.topic,
                chainId: this.driver.Server.isTestnet ? TESTNET : PUBNET,
                request: {
                    jsonrpc: '2.0',
                    method: STELLAR_METHODS.SIGN,
                    params: {
                        xdr,
                    },
                },
            }).then(result => {
                this.driver.session.account.refresh();
                this.driver.session.account.updateOffers();
                return result;
            }),
        });

        return { status: TX_STATUS.SENT_TO_WALLET_CONNECT };
    }
}
