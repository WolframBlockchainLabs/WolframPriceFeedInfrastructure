import Loader from '../loader/Loader.js';
import { exec } from 'child_process';
import util from 'util';
import GapChecker from '../gap-checker/GapChecker.js';

class ReplicaCrashChecker {
    constructor({
        replicaId,
        datatype,
        marketId,
        sequelize,
        logger,
        duration,
    }) {
        this.replicaId = replicaId;
        this.datatype = datatype;
        this.marketId = marketId;
        this.duration = duration;

        this.sequelize = sequelize;
        this.logger = logger;

        this.loader = new Loader(
            'Checking health on replica crash',
            this.duration,
        );

        this.execAsync = util.promisify(exec);
    }

    async execute() {
        try {
            await this.#stopContainer();

            await this.loader.startLoading();

            const isHealthy = await this.#checkHealth();

            await this.#startContainer();

            return isHealthy;
        } catch (error) {
            this.logger.error({ message: 'Error during health check', error });

            throw error;
        }
    }

    async #stopContainer() {
        try {
            this.logger.info(
                `Attempting to stop replica with ID: ${this.replicaId}`,
            );

            await this.execAsync(`docker stop ${this.replicaId}`, {
                stdio: 'inherit',
            });

            this.logger.info(
                `Replica with ID: ${this.replicaId} has been stopped.`,
            );
        } catch (error) {
            this.logger.error({ message: 'Error stopping replica', error });

            throw error;
        }
    }

    async #startContainer() {
        try {
            this.logger.info(
                `Attempting to start replica with ID: ${this.replicaId}`,
            );

            await this.execAsync(`docker start ${this.replicaId}`);

            this.logger.info(
                `Replica with ID: ${this.replicaId} has been restarted.`,
            );
        } catch (error) {
            this.logger.error({ message: 'Error starting replica', error });

            throw error;
        }
    }

    async #checkHealth() {
        const gapChecker = new GapChecker({
            ...this,
            startDate: new Date(new Date().getTime() - this.duration),
            endDate: new Date(),
        });

        const gapCheckResults = await gapChecker.execute();
        const isHealthy = !gapCheckResults.total;

        this.logger.info({
            message: `System is ${
                isHealthy ? 'healthy' : 'unhealthy'
            } after replica crash`,
            gapCheckResults,
        });

        return isHealthy;
    }
}

export default ReplicaCrashChecker;
