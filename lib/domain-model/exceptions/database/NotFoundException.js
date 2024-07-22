import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import DatabaseException from './DatabaseException.js';

class NotFoundException extends DatabaseException {
    constructor(entity) {
        super({
            code: EXCEPTION_CODES.ENTITY_NOT_FOUND,
            entity,
        });
    }
}

export default NotFoundException;
