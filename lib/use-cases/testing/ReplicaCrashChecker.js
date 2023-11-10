import { exec } from 'child_process';
import util from 'util';
import GapChecker from '../../use-cases/testing/GapChecker.js';
import Loader from '../../infrastructure/loader/Loader.js';
import BaseUseCase from '../BaseUseCase.js';
import {
    COLLECTOR_TYPES_DICT,
    COLLECTOR_TYPES_LIST,
} from '../../constants/collectorTypes.js';

class ReplicaCrashChecker extends BaseUseCase {
    static validationRules = {
        replicaId: ['required', 'string'],
        datatype: [
            'string',
            {
                one_of: COLLECTOR_TYPES_LIST,
            },
            { default: COLLECTOR_TYPES_DICT.CANDLE_STICK },
        ],
        duration: ['positive_integer', { default: 300000 }],
        marketId: ['string'],
    };

    constructor(...args) {
        super(...args);

        this.execAsync = util.promisify(exec);
    }

    async execute({ replicaId, datatype, duration, marketId }) {
        this.logger.info(`Starting replica crash test for ${replicaId}`);

        const loader = new Loader('Checking health on replica crash', duration);

        try {
            await this.stopContainer(replicaId);

            await loader.startLoading();

            const gapCheckResults = await this.checkHealth({
                datatype,
                duration,
                marketId,
            });
            const isHealthy = !gapCheckResults.total;

            await this.startContainer(replicaId);

            this.logger.info({
                message: `Finish replica crash test for ${replicaId}. System is ${
                    isHealthy ? 'healthy' : 'unhealthy'
                } after replica crash`,
            });

            return {
                data: {
                    gapCheckResults,
                    isHealthy,
                },
            };
        } catch (error) {
            this.logger.error({ message: 'Error during health check', error });

            throw error;
        }
    }

    async stopContainer(replicaId) {
        try {
            this.logger.info(
                `Attempting to stop replica with ID: ${replicaId}`,
            );

            await this.execAsync(`docker stop ${replicaId}`, {
                stdio: 'inherit',
            });

            this.logger.info(`Replica with ID: ${replicaId} has been stopped.`);
        } catch (error) {
            this.logger.error({ message: 'Error stopping replica', error });

            throw error;
        }
    }

    async startContainer(replicaId) {
        try {
            this.logger.info(
                `Attempting to start replica with ID: ${replicaId}`,
            );

            await this.execAsync(`docker start ${replicaId}`);

            this.logger.info(
                `Replica with ID: ${replicaId} has been restarted.`,
            );
        } catch (error) {
            this.logger.error({ message: 'Error starting replica', error });

            throw error;
        }
    }

    async checkHealth({ datatype, duration, marketId }) {
        const gapChecker = new GapChecker({
            context: {},
        });

        const gapCheckResults = await gapChecker.run({
            rangeDateStart: new Date(new Date().getTime() - duration),
            rangeDateEnd: new Date(),
            datatype,
            marketId,
        });

        return gapCheckResults;
    }
}

export default ReplicaCrashChecker;
