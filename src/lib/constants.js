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
};

export const TX_STATUS = {
    CANCEL: 'cancel',
    FINISH: 'finish',
    AWAIT_SIGNERS: 'await_signers',
    SENT_TO_WALLET_CONNECT: 'sent_to_wallet_connect',
};
