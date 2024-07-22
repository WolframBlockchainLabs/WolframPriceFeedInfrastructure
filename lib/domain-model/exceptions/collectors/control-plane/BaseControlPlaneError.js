import BaseException from '../../BaseException.js';

class BaseControlPlaneError extends BaseException {
    constructor({ message, code, context, error }) {
        super({
            message,
            code,
        });

        this.context = context;
        this.error = error;
    }

    toHash() {
        return {
            ...super.toHash(),
            context: this.context,
            error:
                this.error instanceof BaseException
                    ? this.error.toHash()
                    : this.error,
        };
    }
}

export default BaseControlPlaneError;
