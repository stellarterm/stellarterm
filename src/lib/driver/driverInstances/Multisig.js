import * as StellarSdk from 'stellar-sdk';
import { getEndpoint } from '../../api/endpoints';
import * as request from '../../api/request';
import { TX_STATUS } from '../../constants/sessionConstants';
import { buildOpSetOptions } from '../../helpers/operationBuilders';
import {
    KEY_NAMES,
    MARKER_KEYS,
    MARKER_MAP,
    MULTISIG_PROVIDERS,
    OP_THRESHOLDS,
    PROVIDER_DATA,
    SIGNER_KEY_TYPE,
    SIGNER_KINDS, STELLAR_GUARD_BACKUP_KEY_WEIGHT,
    THRESHOLD_MULTIPLIER,
    THRESHOLD_ORDER,
    THRESHOLDS,
} from '../../constants/multisigConstants';
import { CONTENT_TYPE_HEADER } from '../../constants/commonConstants';

export default class Multisig {
    constructor(driver) {
        this.driver = driver;
    }

    static getShortKey(key) {
        return `${key.slice(0, 18)}...${key.slice(-18)}`;
    }

    static isLobstrVaultKey(key) {
        const headers = { 'Content-Type': 'application/json' };
        const body = JSON.stringify({ address: key });
        return request
            .post(getEndpoint('isVaultSigner'), { headers, body })
            .then(res => res[0].exists)
            .catch(() => false);
    }

    static isStellarGuardKey(key) {
        return request
            .get(getEndpoint('isGuardSigner', { stellarGuardPublicKey: key }))
            .then(({ configuration, code }) => Boolean(configuration && !code))
            .catch(() => false);
    }

    static async getKeyProvider(key) {
        const isVault = await Multisig.isLobstrVaultKey(key);

        if (isVault) {
            return MULTISIG_PROVIDERS.LOBSTR_VAULT;
        }

        const isGuard = await Multisig.isStellarGuardKey(key);

        return isGuard ? MULTISIG_PROVIDERS.STELLAR_GUARD : null;
    }

    get account() {
        return this.driver.session.account;
    }

    get isMultisigEnabled() {
        return Boolean(this.account && this.account.signers.length > 1);
    }

    get multisigProvider() {
        const marker = this.account.signers.find(signer => MARKER_MAP.has(signer.key));

        return marker ? MARKER_MAP.get(marker.key) : null;
    }

    get signers() {
        return this.account.signers.map(({ key, weight, type }) => {
            if (key === this.account.account_id) {
                return {
                    key,
                    weight,
                    type,
                    shortKey: Multisig.getShortKey(key),
                    canRemove: false,
                    kind: SIGNER_KINDS.MASTER,
                    name: KEY_NAMES.MASTER,
                };
            }
            if (MARKER_MAP.has(key)) {
                return {
                    key,
                    weight,
                    type,
                    shortKey: Multisig.getShortKey(key),
                    canRemove: false,
                    kind: SIGNER_KINDS.MARKER,
                    name: KEY_NAMES.MARKER(this.multisigProvider),
                };
            }
            if (this.multisigProvider && weight === THRESHOLD_MULTIPLIER) {
                return {
                    key,
                    weight,
                    type,
                    shortKey: Multisig.getShortKey(key),
                    canRemove: true,
                    kind: SIGNER_KINDS.COSIGNER,
                    name: KEY_NAMES.COSIGNER(this.multisigProvider),
                };
            }
            if (this.multisigProvider === MULTISIG_PROVIDERS.STELLAR_GUARD
                && weight === STELLAR_GUARD_BACKUP_KEY_WEIGHT) {
                return {
                    key,
                    weight,
                    type,
                    shortKey: Multisig.getShortKey(key),
                    canRemove: true,
                    kind: SIGNER_KINDS.BACKUP,
                    name: KEY_NAMES.BACKUP,
                };
            }

            return {
                key,
                weight,
                type,
                shortKey: Multisig.getShortKey(key),
                canRemove: true,
                kind: SIGNER_KINDS.CUSTOM,
                name: KEY_NAMES.CUSTOM,
            };
        }).sort((a, b) =>
            // Marker to the top
            (a.kind === SIGNER_KINDS.MARKER ||
                // Master to the top, but not before marker
                (a.kind === SIGNER_KINDS.MASTER && b.kind !== SIGNER_KINDS.MARKER) ||
                // Marker before master
                (a.kind === SIGNER_KINDS.MARKER && b.kind === SIGNER_KINDS.MARKER)
                ? -1
                : 0),
        );
    }

    /**
     * The method checks whether the multisig settings match the default settings of the stellarterm
     * @returns {boolean}
     */
    get isCustomConfig() {
        let hasCustomSigners = false;
        let markerCount = 0;
        let cosignersCount = 0;

        // check thresholds
        const {
            low_threshold: lowThreshold,
            med_threshold: mediumThreshold,
            high_threshold: highThreshold,
        } = this.account.thresholds;

        const isValidThresholds =
            lowThreshold === mediumThreshold &&
            mediumThreshold === highThreshold &&
            highThreshold % THRESHOLD_MULTIPLIER === 0 &&
            highThreshold > THRESHOLD_MULTIPLIER;

        if (!isValidThresholds) {
            return true;
        }

        // check signers
        this.signers.forEach(({ kind, weight, type }) => {
            if (kind === SIGNER_KINDS.MASTER && (weight !== THRESHOLD_MULTIPLIER || type !== SIGNER_KEY_TYPE)) {
                hasCustomSigners = true;
            }

            if (kind === SIGNER_KINDS.MARKER && (weight !== 1 || type !== SIGNER_KEY_TYPE)) {
                hasCustomSigners = true;
            }

            if (kind === SIGNER_KINDS.COSIGNER && weight !== THRESHOLD_MULTIPLIER) {
                hasCustomSigners = true;
            }

            if (kind === SIGNER_KINDS.CUSTOM &&
                (this.multisigProvider || this.signers.length !== 2 || weight !== THRESHOLD_MULTIPLIER)) {
                hasCustomSigners = true;
            }

            if (kind === SIGNER_KINDS.MARKER) {
                markerCount += 1;
            }

            if (kind === SIGNER_KINDS.COSIGNER) {
                cosignersCount += 1;
            }
        });

        return hasCustomSigners ||
            (this.multisigProvider && markerCount !== 1) ||
            (this.multisigProvider && !cosignersCount);
    }

    get requiredSigners() {
        return this.account.thresholds.high_threshold / THRESHOLD_MULTIPLIER;
    }

    /**
     * The method checks if additional signatures are needed in addition to the master key
     * @param tx - {StellarSdk.Transaction}
     * @returns {boolean}
     */
    moreSignaturesNeeded(tx) {
        const { operations } = tx;

        const transactionThreshold = operations.reduce((acc, operation) => {
            const { type } = operation;

            let usedThreshold = Object.keys(OP_THRESHOLDS).reduce((used, threshold) => {
                if (OP_THRESHOLDS[threshold].includes(type)) {
                    return threshold;
                }
                return used;
            }, THRESHOLDS.UNKNOWN);

            if (usedThreshold === THRESHOLDS.UNKNOWN) {
                throw new Error('unknown operation');
            }

            if (usedThreshold === THRESHOLDS.MULTIPLE) {
                const { masterWeight, lowThreshold, medThreshold, highThreshold, signer } = operation;
                usedThreshold =
                masterWeight || lowThreshold || medThreshold || highThreshold || signer
                    ? THRESHOLDS.HIGH
                    : THRESHOLDS.MED;
            }

            return THRESHOLD_ORDER[usedThreshold] > THRESHOLD_ORDER[acc] ? usedThreshold : acc;
        }, THRESHOLDS.LOW);

        const masterKeyWeight = this.account.signers.find(signer => signer.key === this.account.account_id).weight;

        return masterKeyWeight < this.account.thresholds[transactionThreshold];
    }

    sendToSigner(tx) {
        const xdr = tx.toEnvelope().toXDR('base64');

        if (!this.multisigProvider) {
            setTimeout(() => this.driver.modal.handlers.activate('multisigUnknown', {
                tx: xdr,
                isTestnet: this.driver.Server.isTestnet,
            }), 1000);
        } else {
            const { endpointName, title, logo } = PROVIDER_DATA[this.multisigProvider];
            const body = JSON.stringify({ xdr });
            const headers = CONTENT_TYPE_HEADER;

            request
                .post(getEndpoint(endpointName), { headers, body })
                .then(() => this.driver.modal.handlers.activate('multisig', { title, logo }))
                .catch(e => {
                    console.log(e);
                    this.driver.modal.handlers.activate('multisigUnknown', {
                        tx: xdr,
                        isTestnet: this.driver.Server.isTestnet,
                    });
                });
        }
        return {
            status: TX_STATUS.AWAIT_SIGNERS,
        };
    }

    enableMultisig(key, provider) {
        const signerData = {
            signer: {
                ed25519PublicKey: key,
                weight: THRESHOLD_MULTIPLIER,
            },
            masterWeight: THRESHOLD_MULTIPLIER,
            lowThreshold: THRESHOLD_MULTIPLIER * 2,
            medThreshold: THRESHOLD_MULTIPLIER * 2,
            highThreshold: THRESHOLD_MULTIPLIER * 2,
        };

        if (provider) {
            const markerData = {
                signer: {
                    ed25519PublicKey: MARKER_KEYS[provider],
                    weight: 1,
                },
            };
            const op = buildOpSetOptions([signerData, markerData]);
            return this.driver.session.handlers.buildSignSubmit(op);
        }

        const op = buildOpSetOptions(signerData);
        return this.driver.session.handlers.buildSignSubmit(op);
    }

    addSigner(key) {
        const { signers } = this.account;
        if (signers.find(signer => signer.key === key)) {
            return Promise.reject('This key is already used');
        }
        if (this.isCustomConfig) {
            return Promise.reject('Custom signers weight');
        }
        const currentThreshold = this.requiredSigners * THRESHOLD_MULTIPLIER;
        const newThreshold = currentThreshold + THRESHOLD_MULTIPLIER;
        const signerData = {
            signer: {
                ed25519PublicKey: key,
                weight: THRESHOLD_MULTIPLIER,
            },
            lowThreshold: newThreshold,
            medThreshold: newThreshold,
            highThreshold: newThreshold,
        };
        const op = buildOpSetOptions(signerData);
        return this.driver.session.handlers.buildSignSubmit(op);
    }

    checkGuardSignerActivation() {
        const guardUrl = getEndpoint('activateGuardSigner') + this.account.account_id.toString();

        request
            .get(guardUrl)
            .catch(() => {
                this.activateGuardSigner();
            });
    }

    activateGuardSigner() {
        const guardUrl = getEndpoint('activateGuardSigner') + this.account.account_id.toString();
        request
            .post(guardUrl)
            .then(() => {})
            .catch(e => console.error(e));
    }

    disableMultisig() {
        if (this.isCustomConfig) {
            return Promise.reject('Custom signers weight');
        }

        if (!this.multisigProvider) {
            const custom = this.signers.filter(({ kind }) => kind === SIGNER_KINDS.CUSTOM);
            const signerData = {
                signer: {
                    ed25519PublicKey: custom[0].key,
                    weight: 0,
                },
                masterWeight: 1,
                lowThreshold: 0,
                medThreshold: 0,
                highThreshold: 0,
            };
            const op = buildOpSetOptions(signerData);
            return this.driver.session.handlers.buildSignSubmit(op);
        }

        const cosigner = this.signers.filter(({ kind }) => kind === SIGNER_KINDS.COSIGNER);
        const backup = this.signers.filter(({ kind }) => kind === SIGNER_KINDS.BACKUP);

        if (cosigner.length !== 1) {
            return Promise.reject('You can not disable multisig');
        }

        const params = [];

        const signerData = {
            signer: {
                ed25519PublicKey: cosigner[0].key,
                weight: 0,
            },
            masterWeight: 1,
            lowThreshold: 0,
            medThreshold: 0,
            highThreshold: 0,
        };

        const markerKey = MARKER_KEYS[this.multisigProvider];
        const markerData = {
            signer: {
                ed25519PublicKey: markerKey,
                weight: 0,
            },
        };

        params.push(signerData, markerData);

        if (backup.length) {
            const backupData = {
                signer: {
                    ed25519PublicKey: backup[0].key,
                    weight: 0,
                },
            };
            params.push(backupData);
        }

        const op = buildOpSetOptions(params);
        return this.driver.session.handlers.buildSignSubmit(op);
    }

    removeSigner({ key, kind }) {
        if (this.isCustomConfig) {
            return Promise.reject('Custom signers weight');
        }

        if (kind === SIGNER_KINDS.BACKUP) {
            const params = {
                signer: {
                    ed25519PublicKey: key,
                    weight: 0,
                },
            };

            const op = buildOpSetOptions(params);
            return this.driver.session.handlers.buildSignSubmit(op);
        }

        const cosigners = this.signers.filter(signer => signer.kind === SIGNER_KINDS.COSIGNER);

        if (cosigners.length < 2) {
            return Promise.reject('You can not delete this key');
        }

        const currentThreshold = this.requiredSigners * THRESHOLD_MULTIPLIER;

        const newThreshold =
            cosigners.length * THRESHOLD_MULTIPLIER > currentThreshold
                ? currentThreshold
                : cosigners.length * THRESHOLD_MULTIPLIER;

        const params = {
            signer: {
                ed25519PublicKey: key,
                weight: 0,
            },
            lowThreshold: newThreshold,
            medThreshold: newThreshold,
            highThreshold: newThreshold,
        };

        const op = buildOpSetOptions(params);
        return this.driver.session.handlers.buildSignSubmit(op);
    }

    setRequiredSigners(qty) {
        const newThreshold = qty * THRESHOLD_MULTIPLIER;
        const options = {
            lowThreshold: newThreshold,
            medThreshold: newThreshold,
            highThreshold: newThreshold,
        };

        const op = buildOpSetOptions(options);
        return this.driver.session.handlers.buildSignSubmit(op);
    }

    static sendXdrToVault(xdr) {
        const { endpointName } = PROVIDER_DATA[MULTISIG_PROVIDERS.LOBSTR_VAULT];
        const body = JSON.stringify({ xdr });
        const headers = CONTENT_TYPE_HEADER;

        return request.post(getEndpoint(endpointName), { headers, body });
    }

    static getChallengeTxFromVault(hash) {
        const endpoint = `${getEndpoint('sendTransactionToVault')}${hash}`;

        return request.get(endpoint);
    }


    getSignaturesWeight(xdr, passphrase) {
        let weight = 0;

        const tx = new StellarSdk.Transaction(xdr, passphrase);

        this.driver.session.account.signers.forEach(signer => {
            const kp = StellarSdk.Keypair.fromPublicKey(signer.key);

            const hasSignature = tx.signatures.some(s => kp.verify(tx.hash(), s.signature()));

            if (hasSignature) {
                weight += signer.weight;
            }
        });

        return weight;
    }
}
