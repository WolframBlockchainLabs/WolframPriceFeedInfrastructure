import CandleStick from '../../domain-model/entities/CandleStick.js';
import BaseAMQPWorker from '../BaseAMQPWorker.js';

class CandleStickWriter extends BaseAMQPWorker {
    async execute({ exchange, symbol, payload }) {
        await CandleStick.create(payload);

        this.logger.info(
            `CandleStick for '${exchange} & ${symbol}' have been saved successfully`,
        );
    }
}

export default CandleStickWriter;
