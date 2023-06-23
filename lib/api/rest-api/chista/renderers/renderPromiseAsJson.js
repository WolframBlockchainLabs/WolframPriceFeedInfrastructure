import chista from '../chista.js';
import ChistaException from 'chista/Exception.js';

async function renderPromiseAsJson(req, res, promise) {
    const logger = chista.defaultLogger;

    try {
        const data = await promise;

        data.status = 1;

        return res.send(data);
    } catch (error) {
        if (error instanceof ChistaException.default) {
            res.send({
                status: 0,
                error: error.toHash(),
            });
        } else {
            logger.emerg({
                REQUEST_URL: req.url,
                REQUEST_PARAMS: req.params,
                REQUEST_BODY: req.body,
                ERROR_STACK: error.stack,
                error,
            });

            res.send({
                status: 0,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Please, contact your system administartor!',
                },
            });
        }
    }
}

export default renderPromiseAsJson;
