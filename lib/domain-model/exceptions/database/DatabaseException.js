import BaseException from '../BaseException.js';

class DatabaseException extends BaseException {
    constructor({ entity, ...options }) {
        super(options);

        if (entity) {
            this.entity = entity;
        }
    }

    toHash() {
        return {
            ...super.toHash(),
            ...(this.entity && { entity: this.entity }),
        };
    }
}

export default DatabaseException;
