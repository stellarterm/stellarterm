export const THRESHOLD_MULTIPLIER = 10; // Multisig signer weight
export const SIGNER_KEY_TYPE = 'ed25519_public_key';
export const STELLAR_GUARD_BACKUP_KEY_WEIGHT = 20;

export const MULTISIG_PROVIDERS = {
    LOBSTR_VAULT: 'lobstr-vault',
    STELLAR_GUARD: 'stellar-guard',
};

export const MARKER_KEYS = {
    [MULTISIG_PROVIDERS.LOBSTR_VAULT]: 'GA2T6GR7VXXXBETTERSAFETHANSORRYXXXPROTECTEDBYLOBSTRVAULT',
    [MULTISIG_PROVIDERS.STELLAR_GUARD]: 'GCVHEKSRASJBD6O2Z532LWH4N2ZLCBVDLLTLKSYCSMBLOYTNMEEGUARD',
};

export const MARKER_MAP = Object.keys(MARKER_KEYS).reduce(
    (map, provider) => map.set(MARKER_KEYS[provider], provider),
    new Map(),
);

export const PROVIDER_DATA = {
    [MULTISIG_PROVIDERS.LOBSTR_VAULT]: {
        endpointName: 'sendTransactionToVault',
        title: 'LOBSTR Vault',
        logo: 'sign-vault',
    },
    [MULTISIG_PROVIDERS.STELLAR_GUARD]: {
        endpointName: 'sendTransactionToGuard',
        title: 'StellarGuard',
        logo: 'sign-stellarguard',
    },
};

export const CUSTOM_CONFIG_DATA = {
    title: 'unknown signer',
    logo: 'sign-unknown',
};

export const THRESHOLDS = {
    LOW: 'low_threshold',
    MED: 'med_threshold',
    HIGH: 'high_threshold',
    MULTIPLE: 'multiple',
    UNKNOWN: 'unknown',
};

export const THRESHOLD_ORDER = {
    [THRESHOLDS.LOW]: 1,
    [THRESHOLDS.MED]: 2,
    [THRESHOLDS.HIGH]: 3,
};

export const OP_THRESHOLDS = {
    [THRESHOLDS.LOW]: [
        'allowTrust',
        'inflation',
        'bumpSequence',
        'setTrustLineFlags',
    ],
    [THRESHOLDS.MED]: [
        'createAccount',
        'payment',
        'pathPayment',
        'pathPaymentStrictSend',
        'pathPaymentStrictReceive',
        'manageBuyOffer',
        'manageSellOffer',
        'createPassiveSellOffer',
        'changeTrust',
        'manageData',
        'createClaimableBalance',
        'claimClaimableBalance',
        'beginSponsoringFutureReserves',
        'endSponsoringFutureReserves',
        'revokeSponsorship',
        'clawback',
        'clawbackClaimableBalance',
    ],
    [THRESHOLDS.HIGH]: ['accountMerge'],
    [THRESHOLDS.MULTIPLE]: ['setOptions'], // med or high
};

export const SIGNER_KINDS = {
    MASTER: 'master',
    MARKER: 'marker',
    COSIGNER: 'cosigner',
    CUSTOM: 'custom',
    BACKUP: 'backup',
};

export const KEY_NAMES = {
    MASTER: 'Your account key',
    MARKER: provider => {
        switch (provider) {
            case MULTISIG_PROVIDERS.LOBSTR_VAULT: return 'LOBSTR Vault marker key';
            case MULTISIG_PROVIDERS.STELLAR_GUARD: return 'StellarGuard marker key';
            default: return '';
        }
    },
    COSIGNER: provider => {
        switch (provider) {
            case MULTISIG_PROVIDERS.LOBSTR_VAULT: return 'LOBSTR Vault signer key';
            case MULTISIG_PROVIDERS.STELLAR_GUARD: return 'StellarGuard signer key';
            default: return 'Custom signer key';
        }
    },
    BACKUP: 'Your backup key',
    CUSTOM: 'Custom signer key',
};

export const VAULT_NOT_ALLOW_UNSIGNED_TX_ERROR =
    'Signers of this account do not allow unsigned transactions. Attach a valid signature and resubmit the XDR.';

