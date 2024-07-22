import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import DatabaseException from './DatabaseException.js';

class RelationException extends DatabaseException {
    constructor({ entity, table, detail }) {
        super({
            code: EXCEPTION_CODES.INVALID_RELATION,
            entity,
        });

        this.table = table;
        this.detail = detail;
    }

    toHash() {
        return {
            ...super.toHash(),
            table: this.table,
            detail: this.detail,
        };
    }
}

export default RelationException;
