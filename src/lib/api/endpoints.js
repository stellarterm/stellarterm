import _ from 'lodash';
import * as EnvConsts from '../../env-consts';
import { MARKER_KEYS, MULTISIG_PROVIDERS } from '../constants/multisigConstants';

export const endpoints = {
    stellartermFederationAuth: {
        url: 'api/authentication/',
        baseUrl: EnvConsts.FEDERATION_API_URL,
    },
    getFederation: {
        url: 'federation/',
        baseUrl: EnvConsts.FEDERATION_API_URL,
    },
    setFederation: {
        url: 'federation/manage/',
        baseUrl: EnvConsts.FEDERATION_API_URL,
    },
    isVaultSigner: {
        url: 'check-user/',
        baseUrl: EnvConsts.LOBSTR_VAULT_URL,
    },
    sendTransactionToVault: {
        url: 'transactions/',
        baseUrl: EnvConsts.LOBSTR_VAULT_URL,
    },
    isGuardSigner: {
        url: `accounts/${MARKER_KEYS[MULTISIG_PROVIDERS.STELLAR_GUARD]}/multisig`,
        baseUrl: EnvConsts.STELLAR_GUARD_URL,
    },
    sendTransactionToGuard: {
        url: 'transactions/',
        baseUrl: EnvConsts.STELLAR_GUARD_URL,
    },
    activateGuardSigner: {
        url: 'accounts/',
        baseUrl: EnvConsts.STELLAR_GUARD_URL,
    },
    moonpayStatus: {
        url: 'moonpay/status',
        baseUrl: EnvConsts.MOONPAY_API_URL,
    },
    moonpayCurrencies: {
        url: 'v2/moonpay/currencies',
        baseUrl: EnvConsts.MOONPAY_API_URL,
    },
    moonpayCrypto: {
        url: 'v2/moonpay/crypto-currencies/',
        baseUrl: EnvConsts.MOONPAY_API_URL,
    },
    moonpayCryptoPrice: {
        url: 'moonpay/price/stellarterm/',
        baseUrl: EnvConsts.MOONPAY_API_URL,
    },
    moonpayQuote: {
        url: 'moonpay/quote/stellarterm/',
        baseUrl: EnvConsts.MOONPAY_API_URL,
    },
    moonpayTransaction: {
        url: 'v2/moonpay/transaction/stellarterm/',
        baseUrl: EnvConsts.MOONPAY_API_URL,
    },
};

function getUrlParams(params) {
    return params !== undefined
        ? Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&')
        : null;
}

export function getEndpoint(endpointName, params) {
    if (!_.has(endpoints, endpointName)) {
        return null;
    }

    const endpoint = _.has(endpoints[endpointName], 'baseUrl')
        ? `${endpoints[endpointName].baseUrl}${endpoints[endpointName].url}`
        : `${EnvConsts.HOME_URL}${endpoints[endpointName].url}`;

    // If GET params is provided
    const urlParams = getUrlParams(params);

    return urlParams === null ? endpoint : `${endpoint}?${urlParams}`;
}

export function getUrlWithParams(endpointUrl, params) {
    const urlParams = getUrlParams(params);
    return urlParams === null ? endpointUrl : `${endpointUrl}?${urlParams}`;
}
