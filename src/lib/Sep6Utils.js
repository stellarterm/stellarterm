import * as StellarSdk from 'stellar-sdk';
import * as request from './api/request';
import { getUrlWithParams } from './api/endpoints';

const headers = {};

export async function getJwtTokenUrl(WEB_AUTH_URL, accountId) {
    const params = { account: accountId };
    return getUrlWithParams(WEB_AUTH_URL, params);
}

export async function getTransferServer(domain) {
    const { TRANSFER_SERVER, WEB_AUTH_ENDPOINT } = await StellarSdk.StellarTomlResolver.resolve(domain);

    if (TRANSFER_SERVER) {
        const noSlashOnUrlEnd = TRANSFER_SERVER.slice(-1) !== '/';
        const transferServerUrl = noSlashOnUrlEnd ? `${TRANSFER_SERVER}/` : TRANSFER_SERVER;
        return { TRANSFER_SERVER: transferServerUrl, WEB_AUTH_URL: WEB_AUTH_ENDPOINT };
    }
    return false;
}

export async function getTransferServerInfo(TRANSFER_SERVER) {
    const anchorRequestUrl = `${TRANSFER_SERVER}info`;
    const params = {};

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, params)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}

export async function sep6Request(TRANSFER_SERVER, isDeposit, jwt, requestParams) {
    const anchorRequestUrl = `${TRANSFER_SERVER}${isDeposit ? 'deposit' : 'withdraw'}`;

    if (jwt) {
        headers.Authorization = `JWT: ${jwt}`;
    }

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, requestParams)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}
