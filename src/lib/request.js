import 'whatwg-fetch';

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }

    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

function request(method, url, options) {
    const fetchOptions = Object.assign({ method }, options);
    return fetch(url, fetchOptions)
        .then(checkStatus)
        .then(response => response.json());
}

function get(url, options) {
    return request('GET', url, options);
}

function post(url, options) {
    return request('POST', url, options);
}

function patch(url, options) {
    return request('PATCH', url, options);
}

export { get, post, patch };
