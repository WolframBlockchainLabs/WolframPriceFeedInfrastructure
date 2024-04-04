import BaseAMQPWorker from '../BaseAMQPWorker.js';

class BaseAggregatorWorker extends BaseAMQPWorker {
    constructor(options) {
        super(options);

        this.prefetchCount = 1;
    }
}

export default BaseAggregatorWorker;
