class BaseMarketEventHandler {
    static get EVENT_NAME() {
        throw new Error(
            `[${this.name}]: Value not set for the EVENT_NAME field`,
        );
    }

    constructor({ marketsAMQPManger }) {
        this.marketsAMQPManger = marketsAMQPManger;
    }

    /* istanbul ignore next */
    async init() {}

    /* istanbul ignore next */
    async close() {}

    execute() {
        throw new Error(
            `[${this.constructor.name}]: execute method is not implemented`,
        );
    }

    getEventName() {
        return this.constructor.EVENT_NAME;
    }

    getHandler() {
        return this.execute.bind(this);
    }

    getPolicy(Policy) {
        return this.marketsAMQPManger.getPolicy(Policy);
    }
}

export default BaseMarketEventHandler;
