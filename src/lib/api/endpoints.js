import * as EnvConsts from '../../env-consts';


export const ENDPOINTS = {
    FEDERATION_AUTH: 'FEDERATION_AUTH',
    GET_FEDERATION: 'GET_FEDERATION',
    SET_FEDERATION: 'SET_FEDERATION',
    CHECK_IS_VAULT: 'CHECK_IS_VAULT',
    SEND_TRANSACTION_TO_VAULT: 'SEND_TRANSACTION_TO_VAULT',
    CHECK_IS_GUARD: 'CHECK_IS_GUARD',
    SEND_TRANSACTION_TO_GUARD: 'SEND_TRANSACTION_TO_GUARD',
    ACTIVATE_GUARD_SIGNER: 'ACTIVATE_GUARD_SIGNER',
    MOONPAY_STATUS: 'MOONPAY_STATUS',
    MOONPAY_CURRENCIES: 'MOONPAY_CURRENCIES',
    MOONPAY_CRYPTO: 'MOONPAY_CRYPTO',
    MOONPAY_QUOTE: 'MOONPAY_QUOTE',
    MOONPAY_TRANSACTION: 'MOONPAY_TRANSACTION',
    SMART_ROUTING: 'SMART_ROUTING',
    SWAP_LOG: 'SWAP_LOG',
};

const endpointsMap = new Map([
    [ENDPOINTS.FEDERATION_AUTH, { url: 'api/authentication/', baseUrl: EnvConsts.FEDERATION_API_URL }],
    [ENDPOINTS.GET_FEDERATION, { url: 'federation/', baseUrl: EnvConsts.FEDERATION_API_URL }],
    [ENDPOINTS.SET_FEDERATION, { url: 'federation/manage/', baseUrl: EnvConsts.FEDERATION_API_URL }],
    [ENDPOINTS.CHECK_IS_VAULT, { url: 'check-user/', baseUrl: EnvConsts.LOBSTR_VAULT_URL }],
    [ENDPOINTS.SEND_TRANSACTION_TO_VAULT, { url: 'transactions/', baseUrl: EnvConsts.LOBSTR_VAULT_URL }],
    [ENDPOINTS.CHECK_IS_GUARD, {
        url: 'accounts/GCVHEKSRASJBD6O2Z532LWH4N2ZLCBVDLLTLKSYCSMBLOYTNMEEGUARD/multisig',
        baseUrl: EnvConsts.STELLAR_GUARD_URL,
    }],
    [ENDPOINTS.SEND_TRANSACTION_TO_GUARD, { url: 'transactions/', baseUrl: EnvConsts.STELLAR_GUARD_URL }],
    [ENDPOINTS.ACTIVATE_GUARD_SIGNER, { url: 'accounts/', baseUrl: EnvConsts.STELLAR_GUARD_URL }],
    [ENDPOINTS.MOONPAY_STATUS, { url: 'moonpay/status', baseUrl: EnvConsts.MOONPAY_API_URL }],
    [ENDPOINTS.MOONPAY_CURRENCIES, { url: 'v2/moonpay/currencies', baseUrl: EnvConsts.MOONPAY_API_URL }],
    [ENDPOINTS.MOONPAY_CRYPTO, { url: 'v2/moonpay/crypto-currencies/', baseUrl: EnvConsts.MOONPAY_API_URL }],
    [ENDPOINTS.MOONPAY_QUOTE, { url: 'moonpay/quote/stellarterm/', baseUrl: EnvConsts.MOONPAY_API_URL }],
    [ENDPOINTS.MOONPAY_TRANSACTION, { url: 'v2/moonpay/transaction/stellarterm/', baseUrl: EnvConsts.MOONPAY_API_URL }],
    [ENDPOINTS.SMART_ROUTING, { url: 'smart-routing', baseUrl: EnvConsts.SMART_ROUTING_API }],
    [ENDPOINTS.SWAP_LOG, { url: 'swap/transactions/', baseUrl: EnvConsts.SWAP_LOGS_API }],
]);


function getUrlParams(params) {
    return params !== undefined
        ? Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&')
        : null;
}

export function getEndpoint(endpointName, params) {
    if (!endpointsMap.has(endpointName)) {
        return null;
    }

    const { url, baseUrl } = endpointsMap.get(endpointName);

    const endpoint = `${baseUrl || EnvConsts.HOME_URL}${url}`;

    // If GET params is provided
    const urlParams = getUrlParams(params);

    return urlParams === null ? endpoint : `${endpoint}?${urlParams}`;
}

export function getUrlWithParams(endpointUrl, params) {
    const urlParams = getUrlParams(params);
    return urlParams === null ? endpointUrl : `${endpointUrl}?${urlParams}`;
}
