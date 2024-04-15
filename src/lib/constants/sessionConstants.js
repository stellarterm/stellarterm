export const SESSION_EVENTS = {
    LOGIN_EVENT: 'login_event',
    LOGOUT_EVENT: 'logout_event',
    FEDERATION_SEARCH_EVENT: 'federation_search_event',
    FEDERATION_UPDATE_EVENT: 'federation_update_event',
    LEDGER_EVENT: 'ledger_event',
    ACCOUNT_EVENT: 'account_event',
    ASSETS_DATA_EVENT: 'assets_data_event',
};

export const SESSION_STATE = {
    IN: 'in',
    OUT: 'out',
    UNFUNDED: 'unfunded',
    LOADING: 'loading',
};

export const AUTH_TYPE = {
    SECRET: 'secret',
    PUBKEY: 'pubkey',
    LEDGER: 'ledger',
    TREZOR: 'trezor',
    FREIGHTER: 'freighter',
    WALLET_CONNECT: 'wallet-connect',
    LOBSTR_SIGNER_EXTENSION: 'lobstr-signer-extension',
};

export const TX_STATUS = {
    CANCEL: 'cancel',
    FINISH: 'finish',
    AWAIT_SIGNERS: 'await_signers',
    SENT_TO_WALLET_CONNECT: 'sent_to_wallet_connect',
};

export const UNSUPPORTED_JWT_AUTH_TYPES = new Map([
    [AUTH_TYPE.TREZOR, 'Trezor'],
]);

export const JWT_TOKEN_MINIMUM_REMAINING_LIFETIME = 15 * 60 * 1000; // 15 minutes
