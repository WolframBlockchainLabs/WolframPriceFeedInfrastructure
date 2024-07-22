import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import DatabaseException from './DatabaseException.js';

class ReferencedException extends DatabaseException {
    constructor() {
        super({
            code: EXCEPTION_CODES.ENTITY_IS_REFERENCED,
        });
    }
}

export default ReferencedException;
