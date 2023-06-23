import CandleStick from '../../domain-model/entities/CandleStick.js';
import Collector from '../Base.js';

export class CandleStickCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        // eslint-disable-next-line no-magic-numbers
        const fromTimestamp = exchangeAPI.milliseconds() - 86400;

        try {
            await exchangeAPI.loadMarkets();

            return await exchangeAPI.fetchOHLCV(symbol, '1m', fromTimestamp);
        } catch (error) {
            this.logger.error(
                `Candle stick did not receive from ${exchangeAPI.name} for ${symbol} market`,
                error.message,
            );
        }
    }

    async saveData(charts, marketId) {
        const { exchange, symbol } = this;

        try {
            await CandleStick.create({
                marketId,
                charts,
            });
            this.logger.info('Data for CandleStick have saved successfully');
        } catch (error) {
            this.logger.error(
                `CandleStick did not save for ${exchange} and ${symbol} market`,
                error.message,
            );
        }
    }
}
