import promBundle from 'express-prom-bundle';

const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
});

export default metricsMiddleware;
