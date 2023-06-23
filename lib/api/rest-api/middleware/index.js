import initClsMiddleware from './factories/cls.js';
import initCorsMiddleware from './factories/cors.js';
import helmetMiddleware from './handlers/helmet.js';
import jsonMiddleware from './handlers/json.js';
import metricsMiddleware from './handlers/metrics.js';

export const middleware = {
    json: jsonMiddleware,
    metrics: metricsMiddleware,
    helmet: helmetMiddleware,
};

export const middlewareFactories = {
    cls: initClsMiddleware,
    cors: initCorsMiddleware,
};
