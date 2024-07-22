import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import HTTP_CODES from '#constants/exceptions/http-codes.js';
import BaseException from '#domain-model/exceptions/BaseException.js';

function httpExceptionMapper(error) {
    if (!(error instanceof BaseException)) {
        return HTTP_CODES[EXCEPTION_CODES.SERVER_ERROR];
    }

    return HTTP_CODES[error.getCode()];
}

export default httpExceptionMapper;
