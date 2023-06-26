class BaseWorker {
    constructor({ logger, sequelize }) {
        this.logger = logger;
        this.sequelize = sequelize;
    }

    async process(data) {
        try {
            this.logger.info(`[${this.constructor.name}]: Start`);

            const result = await this.sequelize.transaction(() => {
                return this.execute(data);
            });

            this.logger.info(`[${this.constructor.name}]: Done`);

            return result;
        } catch (error) {
            this.logger.error({
                error,
                stack: error.stack,
                data,
            });
        }
    }
}

export default BaseWorker;
