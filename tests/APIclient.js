import fetch     from 'node-fetch';
import qs        from 'query-string';
import cookie    from 'cookie';
import signature from 'cookie-signature';
import config    from './../lib/config.cjs';

const { appTestPort } = config;

const STATUS_OK = 200;

export default class APIclient {
    constructor(sessionConfig, factory, apiPrefix = 'api/v1') {
        this.token = '';
        this.userId = null;
        this.apiPrefix = apiPrefix;
        this.sessionConfig = sessionConfig;
        this.factory = factory;
    }

    setToken(token) {
        this.token = token;
    }

    dropSessions() {
        this.sessionId = undefined;
    }

    dropUserId() {
        this.userId = undefined;
    }

    asUser({ id }) {
        this.userId = id;

        return this;
    }

    asAnonymous() {
        this.userId = 0;

        return this;
    }

    asUserSession({ userId, sessionId }) {
        this.userId = userId;
        this.sessionId = sessionId;

        return this;
    }

    async request({ endpoint, method, body, params = {}, headers = {}, asJson = true }) {
        const { head, url } = await this.prepareRequest({ endpoint, params, headers });

        if ([ 'POST', 'PATCH', 'PUT' ].includes(method)) {
            head['Content-Type'] = 'application/json';
        }

        const res = await fetch(url, {
            method,
            headers     : head,
            credentials : 'include',
            body        : body ? JSON.stringify(body) : undefined
        });

        this.dropSessions();
        this.dropUserId();

        if (res.headers.get('content-type').includes('application/json') && asJson) {
            const json = await res.json();

            return json;
        }

        if (res.status !== STATUS_OK) {
            console.log(res.status, url);

            return null;
        }

        return res;
    }

    async requestFormData({ endpoint, method, body, params = {}, headers = {} }) {
        const { head, url } = await this.prepareRequest({ endpoint, params, headers });

        const res = await fetch(url, { method, headers: head, body });

        this.dropSessions();
        this.dropUserId();

        if (res.headers.get('content-type').includes('application/json')) {
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

        if (this.userId && !this.sessionId) {
            const session = await this.factory.createUserSession(this.userId);

            this.sessionId = session.sid;
        }

        if (this.userId === 0 && !this.sessionId) {
            const session = await this.factory.createAnonymousSession();

            this.sessionId = session.sid;
        }

        if (this.sessionId) {
            head.Cookie = cookieHeader(this.sessionId, this.sessionConfig.secret, this.sessionConfig.name);
        }

        head['X-CSRF-Token'] = this.factory.csrfToken();

        const query = Object.keys(params).length ? `?${qs.stringify(params)}` : '';
        const url = `http://localhost:${appTestPort}/${this.apiPrefix}${endpoint}${query}`;

        return { head, url };
    }

    get(endpoint, params, headers, asJson = true) {
        return this.request({ endpoint, method: 'GET', params, headers, asJson });
    }

    post(endpoint, body = {}, headers = undefined, asJson = true) {
        return this.request({ endpoint, method: 'POST', body, headers, asJson });
    }

    patch(endpoint, body = {}, headers = undefined, asJson = true) {
        return this.request({ endpoint, method: 'PATCH', body, headers, asJson });
    }

    put(endpoint, body = {}, headers = undefined, asJson = true) {
        return this.request({ endpoint, method: 'PUT', body, headers, asJson });
    }

    delete(endpoint, headers, asJson = true) {
        return this.request({ endpoint, method: 'DELETE', headers, asJson });
    }

    postFormData(endpoint, body = {}, headers = undefined) {
        return this.requestFormData({ endpoint, method: 'POST', body, headers });
    }

    patchFormData(endpoint, body = {}, headers = undefined) {
        return this.requestFormData({ endpoint, method: 'PATCH', body, headers });
    }
}

function cookieHeader(val, secret, name) {
    const signed = `s:${signature.sign(`${val}`, secret)}`;
    const data = cookie.serialize(name, signed);

    return data;
}
