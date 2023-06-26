import fetch from 'node-fetch';
import qs from 'query-string';
import config from './../lib/config.cjs';

const { appTestPort } = config;

const STATUS_OK = 200;

class APIclient {
    constructor(factory, apiPrefix = 'api/v1') {
        this.apiPrefix = apiPrefix;
        this.factory = factory;
    }

    async request({
        endpoint,
        method,
        body,
        params = {},
        headers = {},
        asJson = true,
    }) {
        const { head, url } = await this.prepareRequest({
            endpoint,
            params,
            headers,
        });

        const res = await fetch(url, {
            method,
            headers: head,
            credentials: 'include',
            body: body ? JSON.stringify(body) : undefined,
        });

        if (
            res.headers.get('content-type').includes('application/json') &&
            asJson
        ) {
            const json = await res.json();

            return json;
        }

        if (res.status !== STATUS_OK) {
            console.log(res.status, url);

            return null;
        }

        return res;
    }

    async prepareRequest({ endpoint, params = {}, headers = {} }) {
        const head = { ...headers };

        const query = Object.keys(params).length
            ? `?${qs.stringify(params)}`
            : '';
        const url = `http://localhost:${appTestPort}/${this.apiPrefix}${endpoint}${query}`;

        return { head, url };
    }

    get(endpoint, params, headers, asJson = true) {
        return this.request({
            endpoint,
            method: 'GET',
            params,
            headers,
            asJson,
        });
    }
}

export default APIclient;
