import renderPromiseAsJson from './renderPromiseAsJson.js';

async function middlewareRender({ req, res, next, promise }) {
    try {
        await promise;
    } catch (e) {
        return renderPromiseAsJson({ req, res, promise, next });
    }

    return next();
}

export default middlewareRender;
