import BaseProvider from '../BaseProvider.js';

class AppWorkerProvider extends BaseProvider {
    constructor(WorkerClass) {
        super();

        this.worker = new WorkerClass({
            logger: this.logger,
            sequelize: this.sequelize,
        });
    }

    async run(func) {
        try {
            await func();
        } catch (err) {
            this.logger.error(err);
        } finally {
            await this.shutdown();
        }
    }

    async runWorker(data) {
        await this.run(async () => {
            await this.worker.process(data);
        });
    }

    async runInInterval(newsWorkerInterval, data) {
        await this.run(async () => {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                await this.worker.process(data);

                await new Promise((resolve) =>
                    setTimeout(resolve, newsWorkerInterval),
                );
            }
        });
    }
}

export default AppWorkerProvider;
