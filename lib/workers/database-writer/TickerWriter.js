import Ticker from '../../domain-model/entities/Ticker.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class TickerWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await Ticker.create(payload);

        this.logger.info(
            `Ticker for '${exchange} & ${symbol}' have been saved successfully`,
        );
    }
}

export default TickerWriter;
