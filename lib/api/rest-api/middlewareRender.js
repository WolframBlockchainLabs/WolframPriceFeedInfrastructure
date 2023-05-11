import { renderPromiseAsJson } from './utils/chistaUtils.js';

export async function middlewareRender(req, res, promise, next, logger) {
    try {
        await promise;
    } catch (e) {
        return renderPromiseAsJson(req, res, promise, next, logger);
    }

    return next();
}
