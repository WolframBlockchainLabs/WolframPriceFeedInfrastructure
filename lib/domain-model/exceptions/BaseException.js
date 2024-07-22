class BaseException extends Error {
    constructor({ message, code, fields }) {
        super(message);

        if (!code) throw new Error('EXCEPTION_CODE_REQUIRED');

        this.code = code;

        if (fields) {
            this.fields = fields;
        }
    }

    toHash() {
        return {
            code: this.code,
            ...(this.message && { fields: this.message }),
            ...(this.fields && { fields: this.fields }),
        };
    }

    getCode() {
        return this.code;
    }
}

export default BaseException;
