class RedisLRUCache {
    constructor({
        ioRedisClient,
        namespace = 'default',
        maxCacheSize = 10000,
        ttl = 3600,
    }) {
        this.redis = ioRedisClient;

        this.namespace = namespace;
        this.maxCacheSize = maxCacheSize;
        this.ttl = ttl;

        this.cacheKey = `${this.namespace}:lruCache`;
    }

    _getNamespacedKey(key) {
        return `${this.namespace}:${key}`;
    }

    async addToCache(key, value) {
        const namespacedKey = this._getNamespacedKey(key);
        const timestamp = Date.now();

        await this.redis.zadd(this.cacheKey, timestamp, namespacedKey);
        await this.redis.setex(namespacedKey, this.ttl, JSON.stringify(value));

        const cacheSize = await this.redis.zcard(this.cacheKey);

        if (cacheSize > this.maxCacheSize) {
            const [oldestKey] = await this.redis.zrange(this.cacheKey, 0, 0);

            await this.redis.zrem(this.cacheKey, oldestKey);
            await this.redis.del(oldestKey);
        }
    }

    async getFromCache(key) {
        const namespacedKey = this._getNamespacedKey(key);
        const value = await this.redis.get(namespacedKey);

        if (value) {
            const timestamp = Date.now();

            await this.redis.zadd(this.cacheKey, timestamp, namespacedKey);
            await this.redis.expire(namespacedKey, this.ttl);

            return JSON.parse(value);
        }

        return null;
    }

    async removeFromCache(key) {
        const namespacedKey = this._getNamespacedKey(key);

        await this.redis.zrem(this.cacheKey, namespacedKey);
        await this.redis.del(namespacedKey);
    }

    async clearCache() {
        const keys = await this.redis.zrange(this.cacheKey, 0, -1);

        await this.redis.del(this.cacheKey);

        return Promise.all(keys.map((key) => this.redis.del(key)));
    }
}

export default RedisLRUCache;
