import { AsyncValidator } from 'livr/async.js';
import hash from 'object-hash';
import ChistaServiceBase from '#infrastructure/chista/ChistaServiceBase.cjs';
import RedisLRUCache from '#infrastructure/redis-lru/RedisLRUCache.js';
import FormatException from '#domain-model/exceptions/api/FormatException.js';
import './utils/registerValidationRules.js';

class BaseUseCase extends ChistaServiceBase {
    static TRANSACTIONAL = false;

    static MEMO = false;

    static setAppProvider(appProvider) {
        BaseUseCase.appProvider = appProvider;
    }

    constructor(...args) {
        super(...args);

        this.redisLRUCache = new RedisLRUCache({
            ioRedisClient: this.ioRedisClient,
            namespace: this.constructor.name,
            ...this.config.useCaseLRUCache,
        });
    }

    async run(params) {
        if (this.config.app.cacheEnabled && this.shouldCache(params)) {
            return this.getCachedResult(params);
        }

        return this.runInTransaction(params);
    }

    async systemCall(params) {
        return this.sequelize.transaction(async () => {
            const cleanParams = await this.validate(params);

            return this.execute(cleanParams);
        });
    }

    async getCachedResult(params) {
        const key = hash(params);
        let results = await this.redisLRUCache.getFromCache(key);

        if (!results) {
            results = await this.runInTransaction(params);

            await this.redisLRUCache.addToCache(key, results);
        }

        return results;
    }

    async runInTransaction(params) {
        if (!this.sequelize || !this.isTransactional()) {
            return super.run(params);
        }

        return this.sequelize.transaction(async () => {
            return await super.run(params);
        });
    }

    shouldCache() {
        return this.constructor.MEMO;
    }

    isTransactional() {
        return this.constructor.TRANSACTIONAL;
    }

    async validate(data) {
        const validator =
            this.constructor.cachedValidator ||
            new AsyncValidator(
                this.validationRules ?? this.constructor.validationRules,
                true,
            ).prepare();

        this.constructor.cachedValidator = validator;

        return this._doValidationWithValidator(data, validator);
    }

    async doValidation(data, rules) {
        const validator = new AsyncValidator(rules, true).prepare();

        return this._doValidationWithValidator(data, validator);
    }

    async _doValidationWithValidator(data, validator) {
        try {
            return await validator.validate(data);
        } catch (errors) {
            throw new FormatException(errors);
        }
    }

    get logger() {
        return BaseUseCase.appProvider.logger;
    }

    get sequelize() {
        return BaseUseCase.appProvider.sequelize;
    }

    get ioRedisClient() {
        return BaseUseCase.appProvider.ioRedisClient;
    }

    get amqpClient() {
        return BaseUseCase.appProvider.amqpClient;
    }

    get config() {
        return BaseUseCase.appProvider.config;
    }

    get maxItemsRetrieved() {
        return BaseUseCase.appProvider.config.apiLimits.maxItemsRetrieved;
    }
}

export default BaseUseCase;
