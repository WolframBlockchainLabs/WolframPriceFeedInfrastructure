import {
    COLLECTOR_TYPES_DICT,
    COLLECTOR_TYPES_LIST,
} from '../../constants/collectorTypes.js';
import ReplicaCrashChecker from '../../infrastructure/replica-crash-checker/ReplicaCrashChecker.js';
import BaseCLIRunner from '../BaseCLIRunner.js';
import './options_schema.js';

class CheckReplicaCrashRunner extends BaseCLIRunner {
    optionsValidationRules = {
        replicaId: ['required', 'string'],
        duration: ['positive_integer', { default: 300000 }],
        datatype: [
            'string',
            {
                one_of: COLLECTOR_TYPES_LIST,
            },
            { default: COLLECTOR_TYPES_DICT.CANDLE_STICK },
        ],
        marketId: ['string'],
    };

    async process({ options: { replicaId, duration, datatype, marketId } }) {
        this.logger.info(`Starting replica crash test for ${replicaId}`);

        const replicaCrashChecker = new ReplicaCrashChecker({
            replicaId,
            datatype,
            marketId,
            duration,

            logger: this.logger,
            sequelize: this.sequelize,
        });

        const isHealthy = await replicaCrashChecker.execute();

        this.logger.info({
            message: `Finish replica crash test for ${replicaId}`,
            isHealthy,
        });
    }
}

export default CheckReplicaCrashRunner;
