class BaseWorker {
    constructor({ logger, sequelize }) {
        this.logger = logger;
        this.sequelize = sequelize;
    }

    async process(data) {
        try {
            const result = await this.sequelize.transaction(() => {
                return this.execute(data);
            });

            return result;
        } catch (error) {
            this.logger.error({
                error,
                stack: error.stack,
                data,
            });
        }
    }

    execute() {}
}

export default BaseWorker;
