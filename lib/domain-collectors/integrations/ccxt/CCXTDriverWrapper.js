// eslint-disable-next-line import/no-unresolved
import ccxt, { RateLimitExceeded as CCXTRateLimitExceeded } from 'ccxt';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class CCXTDriverWrapper {
    constructor({ exchangeId }) {
        this.exchangeId = exchangeId;
        this.exchangeAPI = new ccxt[exchangeId]();
    }

    async loadMarkets(...args) {
        return this.fetchWithErrorTranslation(() =>
            this.exchangeAPI.loadMarkets(...args),
        );
    }

    async fetchOHLCV(...args) {
        return this.fetchWithErrorTranslation(() =>
            this.exchangeAPI.fetchOHLCV(...args),
        );
    }

    async fetchOrderBook(...args) {
        return this.fetchWithErrorTranslation(() =>
            this.exchangeAPI.fetchOrderBook(...args),
        );
    }

    async fetchTicker(...args) {
        return this.fetchWithErrorTranslation(() =>
            this.exchangeAPI.fetchTicker(...args),
        );
    }

    async fetchTrades(...args) {
        return this.fetchWithErrorTranslation(() =>
            this.exchangeAPI.fetchTrades(...args),
        );
    }

    async fetchWithErrorTranslation(fetchFunction) {
        try {
            return await fetchFunction();
        } catch (error) {
            if (error instanceof CCXTRateLimitExceeded) {
                throw new RateLimitExceededException();
            }
            throw error;
        }
    }
}

export default CCXTDriverWrapper;
