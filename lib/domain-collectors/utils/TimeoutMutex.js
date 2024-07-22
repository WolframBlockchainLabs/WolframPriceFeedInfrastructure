import MutexTimeoutException from '#domain-model/exceptions/collectors/MutexTimeoutException.js';
import { Mutex } from 'async-mutex';

class TimeoutMutex extends Mutex {
    constructor(timeout, error = new MutexTimeoutException()) {
        super();

        if (!timeout) {
            throw new Error(
                `[${this.constructor.name}]: timeout is not specified`,
            );
        }

        this.timeout = timeout;
        this.error = error;

        this.timeoutHandle = null;
        this.currentRelease = null;
    }

    async acquire(timeout) {
        this.currentRelease = await super.acquire();

        this.setTimeoutHandler(timeout);

        return () => {
            clearTimeout(this.timeoutHandle);
            this.currentRelease();
        };
    }

    addTimeout(timeout) {
        this.setTimeoutHandler(timeout + this.timeout);
    }

    updateTimeout(timeout) {
        this.timeout = timeout;

        this.setTimeoutHandler(timeout);
    }

    changeTimeout(timeout) {
        this.setTimeoutHandler(timeout);
    }

    reloadTimeout() {
        this.setTimeoutHandler();
    }

    setTimeoutHandler(timeout) {
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
        }

        this.timeoutHandle = setTimeout(() => {
            if (!this.isLocked()) return;

            this.currentRelease();

            throw this.error;
        }, timeout ?? this.timeout);
    }
}

export default TimeoutMutex;
