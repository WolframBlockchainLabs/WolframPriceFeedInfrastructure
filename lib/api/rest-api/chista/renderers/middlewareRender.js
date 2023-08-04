import renderPromiseAsJson from './renderPromiseAsJson.js';

export async function middlewareRender(req, res, promise, next) {
    try {
        await promise;
    } catch (e) {
        return renderPromiseAsJson(req, res, promise, next);
    }

    return next();
}
