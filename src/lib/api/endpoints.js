import _ from 'lodash';

import * as EnvConsts from '../../env-consts';

export const endpoints = {
    getJwtToken: {
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
};

export function getEndpoint(endpointName, params) {
    if (!_.has(endpoints, endpointName)) {
        return null;
    }

    const endpoint = _.has(endpoints[endpointName], 'baseUrl')
        ? `${endpoints[endpointName].baseUrl}${endpoints[endpointName].url}`
        : `${EnvConsts.HOME_URL}${endpoints[endpointName].url}`;

    // If GET params is provided
    const urlParams =
        params !== undefined
            ? Object.keys(params)
                  .map(key => `${key}=${encodeURIComponent(params[key])}`)
                  .join('&')
            : null;

    return urlParams === null ? endpoint : `${endpoint}?${urlParams}`;
}
