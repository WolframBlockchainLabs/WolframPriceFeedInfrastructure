/* eslint-disable no-param-reassign  */

import { renderPromiseAsJson } from './utils/chistaUtils.js';

export async function sessionRender(req, res, promise, next, logger) {
    try {
        const result = await promise;

        req.session.context = result.context;
    } catch (e) {
        return renderPromiseAsJson(req, res, promise, next, logger);
    }

    return renderPromiseAsJson(req, res, promise, next, logger);
}
