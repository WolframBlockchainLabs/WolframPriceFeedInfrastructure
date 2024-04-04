import AppAMQPProvider from '../AppAMQPProvider.js';
import { AGGREGATOR_QUEUES } from '#constants/rabbimqQueues.js';
import CandlesDiscreteAggregator from './CandlesDiscreteAggregator.js';

const provider = new AppAMQPProvider({
    candlesDiscreteAggregator: {
        queue: AGGREGATOR_QUEUES.candleStick.discrete,
        ConsumerClass: CandlesDiscreteAggregator,
    },
});

provider.start();
