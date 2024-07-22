import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import BaseException from '../BaseException.js';

class FormatException extends BaseException {
    constructor(fields) {
        super({
            code: EXCEPTION_CODES.FORMAT_ERROR,
            fields,
        });
    }
}

export default FormatException;
