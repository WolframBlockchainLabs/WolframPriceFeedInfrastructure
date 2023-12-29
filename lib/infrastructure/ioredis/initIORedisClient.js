import { Redis } from 'ioredis';

function initIORedisClient(config) {
    return new Redis(config);
}

export default initIORedisClient;
