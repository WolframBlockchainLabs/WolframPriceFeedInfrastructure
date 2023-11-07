class BaseEmitter {
    constructor({ io, logger, config }) {
        this.logger = logger;
        this.io = io;
        this.config = config;
    }

    run() {
        this.logger.info(`[WSApp] Initiating ${this.constructor.name}`);
    }
}

export default BaseEmitter;
