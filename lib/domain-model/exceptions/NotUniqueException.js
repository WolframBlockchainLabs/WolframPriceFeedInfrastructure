import Exception from './Exception.js';

class NotUniqueException extends Exception {
    constructor({ code, fields = {} }) {
        super({
            code,
            fields,
        });
    }
}

export default NotUniqueException;
