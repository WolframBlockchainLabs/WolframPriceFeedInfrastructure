import { Validator } from 'livr';
import hash from 'object-hash';
import ChistaServiceBase from '#infrastructure/chista/ChistaServiceBase.cjs';
import RedisLRUCache from '#infrastructure/redis-lru/RedisLRUCache.js';
import './utils/registerValidationRules.js';

class BaseUseCase extends ChistaServiceBase {
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

    async run(...args) {
        if (!this.shouldCache(...args)) return this.runInTransaction(args);

        return this.getCachedResult(args);
    }

    async systemCall(params) {
        return this.sequelize.transaction(async () => {
            const cleanParams = await this.validate(params);

            return this.execute(cleanParams);
        });
    }

    async getCachedResult(args) {
        const key = hash(args);
        let results = await this.redisLRUCache.getFromCache(key);

        if (!results) {
            results = await this.runInTransaction(args);

            await this.redisLRUCache.addToCache(key, results);
        }

        return results;
    }

    async runInTransaction(args) {
        if (!this.sequelize || !this.isTransactional()) {
            return super.run(...args);
        }

        return this.sequelize.transaction(async () => {
            return await super.run(...args);
        });
    }

    shouldCache() {
        return false;
    }

    isTransactional() {
        return false;
    }

    validate(data) {
        const validator =
            this.constructor.cachedValidator ||
            new Validator(
                this.validationRules ?? this.constructor.validationRules,
                true,
            ).prepare();

        this.constructor.cachedValidator = validator;

        return this._doValidationWithValidator(data, validator);
    }

    doValidation(data, rules) {
        const validator = new Validator(rules, true).prepare();

        return this._doValidationWithValidator(data, validator);
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
