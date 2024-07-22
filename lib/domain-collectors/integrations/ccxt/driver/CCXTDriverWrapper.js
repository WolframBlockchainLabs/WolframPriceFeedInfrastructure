import ccxt, {
    RateLimitExceeded as CCXTRateLimitExceeded,
    DDoSProtection as CCXTDDoSProtection,
} from 'ccxt';
import RateLimitExceededException from '#domain-model/exceptions/collectors/RateLimitExceededException.js';

class CCXTDriverWrapper {
    constructor({ exchangeId, apiAccess }) {
        this.exchangeId = exchangeId;
        this.apiAccess = apiAccess;

        this.exchangeAPI = new ccxt[this.exchangeId](this.apiAccess);
    }

    get timeframes() {
        return this.exchangeAPI.timeframes;
    }

    get currencies() {
        return this.exchangeAPI.currencies;
    }

    get rateLimit() {
        return this.exchangeAPI.rateLimit;
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
            if (
                error instanceof CCXTRateLimitExceeded ||
                error instanceof CCXTDDoSProtection
            ) {
                throw new RateLimitExceededException();
            }
            throw error;
        }
    }
}

export default CCXTDriverWrapper;
