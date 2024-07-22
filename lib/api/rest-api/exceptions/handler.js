import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseException from '#domain-model/exceptions/BaseException.js';
import httpExceptionMapper from './mapper.js';

function initExceptionHandler(logger) {
    // eslint-disable-next-line no-unused-vars
    return (error, req, res, next) => {
        const httpStatus = httpExceptionMapper(error);

        if (error instanceof BaseException) {
            return res.status(httpStatus).send({
                status: 0,
                error: error.toHash(),
            });
        }

        logger.emerg({
            REQUEST_URL: req.url,
            REQUEST_PARAMS: req.params,
            REQUEST_BODY: req.body,
            error,
        });

        res.status(httpStatus).send({
            status: 0,
            error: {
                code: EXCEPTION_CODES.SERVER_ERROR,
                message: 'Please, contact your system administrator!',
            },
        });
    };
}

export default initExceptionHandler;
