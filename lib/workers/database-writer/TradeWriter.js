import Trade from '../../domain-model/entities/Trade.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TradeWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await Trade.create(payload);

        this.logger.info(
            `Trade for '${exchange} & ${symbol}' have been saved successfully`,
        );
    }
}

export default TradeWriter;
