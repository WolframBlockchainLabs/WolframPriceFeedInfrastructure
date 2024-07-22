import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import DatabaseException from './DatabaseException.js';

class NotUniqueException extends DatabaseException {
    constructor({ entity, fields = {} }) {
        super({
            code: EXCEPTION_CODES.ENTITY_NOT_UNIQUE,
            fields,
            entity,
        });
    }
}

export default NotUniqueException;
