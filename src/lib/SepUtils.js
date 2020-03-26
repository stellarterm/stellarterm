/* eslint-disable no-param-reassign */
import * as StellarSdk from 'stellar-sdk';
import * as request from './api/request';
import { getUrlWithParams } from './api/endpoints';

const headers = {};

export async function getJwtTokenUrl(WEB_AUTH_URL, accountId) {
    const params = { account: accountId };
    return getUrlWithParams(WEB_AUTH_URL, params);
}

export async function getTransferServer(domain) {
    const {
        TRANSFER_SERVER,
        TRANSFER_SERVER_SEP0024,
        WEB_AUTH_ENDPOINT,
        NETWORK_PASSPHRASE,
    } = await StellarSdk.StellarTomlResolver.resolve(domain);

    if (TRANSFER_SERVER_SEP0024 || TRANSFER_SERVER) {
        const noSlashOnUrlEnd = TRANSFER_SERVER ? TRANSFER_SERVER.slice(-1) !== '/' : TRANSFER_SERVER;
        const transferServerUrl = noSlashOnUrlEnd ? `${TRANSFER_SERVER}/` : TRANSFER_SERVER;
        const noSlashOnUrl24End = TRANSFER_SERVER_SEP0024 ? TRANSFER_SERVER_SEP0024.slice(-1) !== '/' : TRANSFER_SERVER_SEP0024;
        const transferServer24Url = noSlashOnUrl24End ? `${TRANSFER_SERVER_SEP0024}/` : TRANSFER_SERVER_SEP0024;

        return {
            TRANSFER_SERVER_SEP0024: transferServer24Url,
            TRANSFER_SERVER: transferServerUrl,
            WEB_AUTH_URL: WEB_AUTH_ENDPOINT,
            NETWORK_PASSPHRASE,
        };
    }
    return null;
}

export async function getTransferServerInfo(TRANSFER_SERVER) {
    const anchorRequestUrl = `${TRANSFER_SERVER}info`;
    const params = {};

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, params)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}

export function objectToFormData(object) {
    return Object.keys(object).reduce((formData, key) => {
        formData.append(key, object[key]);
        return formData;
    }, new FormData());
}

export async function sep6Request(TRANSFER_SERVER, isDeposit, jwt, requestParams) {
    const anchorRequestUrl = `${TRANSFER_SERVER}${isDeposit ? 'deposit' : 'withdraw'}`;

    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, requestParams)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}

export async function sep24Request(TRANSFER_SERVER, isDeposit, jwt, requestParams) {
    const anchorRequestUrl = `${TRANSFER_SERVER}transactions/${isDeposit ? 'deposit' : 'withdraw'}/interactive`;

    headers.Authorization = `Bearer ${jwt}`;
    const body = objectToFormData(requestParams);

    return request
        .post(`${getUrlWithParams(anchorRequestUrl)}`, { headers, body })
        .then(res => res)
        .catch(res => res.data);
}

export async function getTransactions(TRANSFER_SERVER, requestParams, jwt, isSep24) {
    const anchorRequestUrl = `${TRANSFER_SERVER}transactions`;
    const jwtString = `Bearer ${jwt}`;
    headers.Authorization = jwtString;

    if (isSep24) { delete requestParams.account; }

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, requestParams)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}

export async function getTransaction(TRANSFER_SERVER, requestParams, jwt, isSep24) {
    const anchorRequestUrl = `${TRANSFER_SERVER}transaction`;
    const jwtString = `Bearer ${jwt}`;
    headers.Authorization = jwtString;

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, requestParams)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}
