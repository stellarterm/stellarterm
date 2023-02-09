import WalletConnectClient, { SIGN_CLIENT_EVENTS } from '@walletconnect/sign-client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { getInternalError, getSdkError } from '@walletconnect/utils';
import * as StellarSdk from 'stellar-sdk';
import { AUTH_TYPE, TX_STATUS } from '../../constants/sessionConstants';
import Sep7Handler from '../../../components/HomePage/Sep7Handler/Sep7Handler';

const PROJECT_ID = '2b3adbd81527ef317a8e791759d34d20';

const METADATA = {
    name: 'StellarTerm',
    description: 'StellarTerm is an advanced web-based trading client for the Stellar network. ' +
        'Send, receive, and trade assets on the Stellar network easily with StellarTerm.',
    url: 'https://stellarterm.com',
    icons: ['https://avatars.githubusercontent.com/u/25021964?s=200&v=4.png'],
};

const PUBNET = 'stellar:pubnet';

const STELLAR_METHODS = {
    SIGN_AND_SUBMIT: 'stellar_signAndSubmitXDR',
    SIGN: 'stellar_signXDR',
};

const REQUIRED_NAMESPACES = {
    stellar: {
        chains: [PUBNET],
        methods: Object.values(STELLAR_METHODS),
        events: [],
    },
};

export default class WalletConnectService {
    constructor(driver) {
        this.driver = driver;
        this.appMeta = null;
        this.client = null;
        this.session = null;
    }

    async initWalletConnect() {
        if (!this.driver.isOnline) {
            this.driver.toastService.error('No connection', 'Internet connection appears to be offline');
        }
        if (this.client) {
            return null;
        }
        this.client = await WalletConnectClient.init({
            // logger: 'debug',
            projectId: PROJECT_ID,
            metadata: METADATA,
        });

        this.listenWalletConnectEvents();

        if (!this.client.session.length) {
            return null;
        }

        this.session =
            await this.client.session.getAll()[0];

        // eslint-disable-next-line no-unused-vars
        const [chain, reference, publicKey] = this.session.namespaces.stellar.accounts[0].split(':');
        this.appMeta = this.session.peer.metadata;
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);

        await this.driver.session.handlers.logIn(keypair, {
            authType: AUTH_TYPE.WALLET_CONNECT,
        });

        return 'logged';
    }

    clearClient() {
        if (this.client) {
            this.client = null;
        }
    }

    async restoreConnectionIfNeeded() {
        if (this.session) {
            this.client = await WalletConnectClient.init({
                // logger: 'debug',
                projectId: PROJECT_ID,
                metadata: METADATA,
            });
        }
    }

    listenWalletConnectEvents() {
        this.client.on(SIGN_CLIENT_EVENTS.session_delete, ({ topic }) => this.onSessionDeleted(topic));
    }

    onSessionDeleted(topic) {
        if (this.session && this.session.topic === topic) {
            this.session = null;
            this.appMeta = null;
            this.driver.session.handlers.handleLogout();
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

        if (this.client.pairing.getAll({ active: true }).length > 3) {
            const deletePromises = [];
            this.client.pairing
                .getAll({ active: true })
                .slice(0, -3)
                .forEach(pairing => {
                    deletePromises.push(this.client.pairing.delete(pairing.topic, getInternalError('UNKNOWN_TYPE')));
                });

            await Promise.all(deletePromises);
        }

        if (this.client.pairing.getAll({ active: true }).length) {
            this.driver.modal.handlers.activate('WalletConnectPairingModal', {
                pairings: this.client.pairing.getAll({ active: true }).reverse(),
                connect: this.connect.bind(this),
                deletePairing: this.deletePairing.bind(this),
            });
            return;
        }

        await this.connect();
    }

    async deletePairing(topic) {
        await this.client.pairing.delete(topic, getInternalError('UNKNOWN_TYPE'));
    }

    async connect(pairing) {
        if (!this.driver.isOnline) {
            this.driver.toastService.error('No connection', 'Internet connection appears to be offline');
        }
        if (this.driver.modal.modalName === 'WalletConnectPairingModal') {
            this.driver.modal.handlers.finish();
        }
        if (pairing) {
            this.driver.modal.handlers.activate('WalletConnectSessionRequestModal', {
                title: pairing.peerMetadata.name,
                logo: pairing.peerMetadata.icons[0],
            });
        }

        try {
            const { uri, approval } = await this.client.connect({
                pairingTopic: pairing ? pairing.topic : undefined,
                requiredNamespaces: REQUIRED_NAMESPACES,
            });

            if (!pairing) {
                this.driver.modal.handlers.activate('WalletConnectQRModal', uri);
            }

            this.session = await approval();
        } catch (e) {
            if (this.session) {
                return Promise.resolve({ status: 'cancel' });
            }
            this.appMeta = null;
            if (e.message === 'cancelled') {
                return Promise.resolve({ status: 'cancel' });
            }
            const errorMessage = (
                e.message === 'rejected' ||
                e.message === '' ||
                e.code === getSdkError('USER_REJECTED').code
            ) ?
                'Connection canceled by the user' :
                e.message;
            this.driver.toastService.error('Connection unsuccessful', errorMessage);
            return this.driver.modal.handlers.cancel();
        }

        this.driver.modal.handlers.cancel();
        this.appMeta = this.session.peer.metadata;

        // eslint-disable-next-line no-unused-vars
        const [chain, reference, publicKey] = this.session.namespaces.stellar.accounts[0].split(':');
        const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
        return this.driver.session.handlers.logIn(keypair, {
            authType: AUTH_TYPE.WALLET_CONNECT,
        }).then(() => {
            Sep7Handler(this.driver);

            if (pairing) {
                this.client.pairing.update(pairing.topic, {
                    peerMetadata: this.appMeta,
                });
            }
        });
    }

    async logout() {
        if (this.session) {
            await this.client.disconnect({
                topic: this.session.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            });
            this.onSessionDeleted(this.session.topic);
        }
    }

    signAndSubmitTx(tx) {
        if (this.driver.modal.modalName) {
            this.driver.modal.handlers.finish();
        }

        const xdr = tx.toEnvelope().toXDR('base64');

        this.driver.modal.handlers.activate('WalletConnectRequestModal', {
            title: this.appMeta.name,
            logo: this.appMeta.icons[0],
            result: this.client.request({
                topic: this.session.topic,
                chainId: PUBNET,
                request: {
                    method: STELLAR_METHODS.SIGN_AND_SUBMIT,
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

    signTx(tx) {
        if (this.driver.modal.modalName) {
            this.driver.modal.handlers.finish();
        }

        const xdr = tx.toEnvelope().toXDR('base64');

        return new Promise(((resolve, reject) => {
            this.driver.modal.handlers.activate('WalletConnectRequestModal', {
                title: this.appMeta.name,
                logo: this.appMeta.icons[0],
                result: this.client.request({
                    topic: this.session.topic,
                    chainId: PUBNET,
                    request: {
                        method: STELLAR_METHODS.SIGN,
                        params: {
                            xdr,
                        },
                    },
                }).then(({ signedXDR }) => {
                    resolve(signedXDR);
                    return ({
                        status: 'success',
                    });
                }).catch(() => {
                    reject('Cancelled by user');

                    throw new Error();
                }),
            });
        }));
    }
}
