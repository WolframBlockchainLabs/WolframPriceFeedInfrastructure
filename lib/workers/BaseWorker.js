class BaseWorker {
    constructor(logger) {
        this.logger = logger;
    }

    async process(data) {
        try {
            this.logger.info('Start');

            const result = await this.execute(data);

            this.logger.info('Done');

            return result;
        } catch (error) {
            this.logger.error({
                error,
                payload: data.payload,
            });
        }
    }
}

export default BaseWorker;
