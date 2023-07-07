import BaseProvider from '../BaseProvider.js';

class AppWorkerProvider extends BaseProvider {
    constructor(WorkerClass) {
        super();

        this.worker = new WorkerClass({
            logger: this.logger,
            sequelize: this.sequelize,
        });
    }

    async runWorker(data) {
        await this.start();

        try {
            await this.worker.process(data);
        } catch (err) {
            this.logger.error(err);
        } finally {
            await this.shutdown();
        }
    }

    async runInInterval(newsWorkerInterval, data) {
        await this.start();

        setInterval(async () => {
            try {
                await this.worker.process(data);
            } catch (err) {
                this.logger.error(err);
            }
        }, newsWorkerInterval);
    }
}

export default AppWorkerProvider;
