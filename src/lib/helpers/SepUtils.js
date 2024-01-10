/* eslint-disable no-param-reassign */
import * as StellarSdk from '@stellar/stellar-sdk';
import directory from 'stellarterm-directory';
import * as request from '../api/request';
import { getUrlWithParams } from '../api/endpoints';

let headers = {};

export function checkAssetSettings(asset) {
    return {
        isDepositEnabled: (asset.anchors && asset.anchors.length)
            ? asset.anchors.some(anchor => anchor.deposit) : asset.deposit,
        isWithdrawEnabled: (asset.anchors && asset.anchors.length)
            ? asset.anchors.some(anchor => anchor.withdraw) : asset.withdraw,
        isHistoryEnabled: (asset.anchors && asset.anchors.length)
            ? asset.anchors.some(anchor => anchor.history) : asset.history,
    };
}

export const getTransferDomain = async (asset, type, modal, transferDomain) => {
    if (!asset.anchors.length) {
        return {
            output: {
                domain: asset.customTransferDomain || asset.domain,
                support: asset.customTransferSupport || directory.getAnchor(asset.domain).support,
                isSep24: asset.sep24,
            },
        };
    }

    const enabledAnchors = asset.anchors.reduce((acc, anchor) => {
        if (anchor[type]) {
            acc.push(anchor);
        }
        return acc;
    }, []);

    if (enabledAnchors.length === 1) {
        return {
            output: {
                domain: enabledAnchors[0].domain,
                support: enabledAnchors[0].support,
                isSep24: enabledAnchors[0].sep24,
            },
        };
    }

    if (transferDomain) {
        const choseAnchor = enabledAnchors.find(anchor => anchor.domain === transferDomain);

        return {
            output: choseAnchor ? {
                domain: choseAnchor.domain,
                support: choseAnchor.support,
                isSep24: choseAnchor.sep24,
            } : null,
        };
    }

    return modal.handlers.activate('ChooseTransferServer', { anchors: enabledAnchors, type, asset });
};

export async function getTransferServer(asset, type, modal, transferDomain) {
    const { output } = await getTransferDomain(asset, type, modal, transferDomain);

    if (!output) {
        return 'cancelled';
    }

    const { domain, support, isSep24 } = output;

    if (transferDomain && transferDomain !== domain) {
        return 'cancelled';
    }

    try {
        const {
            TRANSFER_SERVER,
            TRANSFER_SERVER_SEP0024,
            WEB_AUTH_ENDPOINT,
            NETWORK_PASSPHRASE,
        } = await StellarSdk.StellarToml.Resolver.resolve(domain);

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
                SUPPORT: support,
                IS_SEP24: isSep24,
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

export async function getTransferServerInfo(TRANSFER_SERVER) {
    const anchorRequestUrl = `${TRANSFER_SERVER}info`;
    const params = {};

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, params)}`)
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

export async function getTransactions(TRANSFER_SERVER, requestParams, jwt, isSep24, noAuth) {
    const anchorRequestUrl = `${TRANSFER_SERVER}transactions`;
    const jwtString = `Bearer ${jwt}`;
    headers.Authorization = jwtString;

    if (noAuth) { headers = {}; }
    if (isSep24) { delete requestParams.account; }

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, requestParams)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}

export async function getTransaction(TRANSFER_SERVER, requestParams, jwt) {
    const anchorRequestUrl = `${TRANSFER_SERVER}transaction`;
    const jwtString = `Bearer ${jwt}`;
    headers.Authorization = jwtString;

    return request
        .get(`${getUrlWithParams(anchorRequestUrl, requestParams)}`, { headers })
        .then(res => res)
        .catch(res => res.data);
}
