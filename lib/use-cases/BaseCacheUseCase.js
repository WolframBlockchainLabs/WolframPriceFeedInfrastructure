import RedisLRUCache from '#infrastructure/redis-lru/RedisLRUCache.js';
import BaseUseCase from './BaseUseCase.js';
import hash from 'object-hash';

class BaseCacheUseCase extends BaseUseCase {
    constructor(...args) {
        super(...args);

        this.redisLRUCache = new RedisLRUCache({
            ioRedisClient: this.ioRedisClient,
            namespace: this.constructor.name,
            ...this.config.useCaseLRUCache,
        });
    }

    async run(...args) {
        if (!this.shouldCache(...args)) return super.run(...args);

        const key = hash(args);
        let results = await this.redisLRUCache.getFromCache(key);

        if (!results) {
            results = await super.run(...args);

            await this.redisLRUCache.addToCache(key, results);
        }

        return results;
    }

    shouldCache({ rangeDateEnd }) {
        return Date.now() > new Date(rangeDateEnd).getTime();
    }
}

export default BaseCacheUseCase;
