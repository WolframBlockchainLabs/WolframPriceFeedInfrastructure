import CandleStick from '../../domain-model/entities/CandleStick.js';
import BaseCollector from '../BaseCollector.js';

class CandleStickCollector extends BaseCollector {
    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        const fromTimestamp = exchangeAPI.milliseconds() - 86400;

        try {
            await exchangeAPI.loadMarkets();

            return await exchangeAPI.fetchOHLCV(symbol, '1m', fromTimestamp);
        } catch (error) {
            this.logger.error({
                message: `Could not get CandleStick for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(charts, marketId) {
        const { exchange, symbol } = this;

        try {
            await CandleStick.create({
                marketId,
                charts,
            });

            this.logger.info(
                `CandleStick for '${exchange} & ${symbol}' have been saved successfully`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not save CandleStick for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }
}

export default CandleStickCollector;
