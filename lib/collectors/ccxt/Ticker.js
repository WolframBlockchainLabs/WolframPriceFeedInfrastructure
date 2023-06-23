import Ticker from '../../domain-model/entities/Ticker.js';
import Collector from '../Base.js';

export class TickerCollector extends Collector {
    async fetchData() {
        const { exchange, exchangeAPI, symbol } = this;

        await exchangeAPI.loadMarkets();

        try {
            return await exchangeAPI.fetchTicker(symbol);
        } catch (error) {
            this.logger.error({
                message: `Could not get Ticker for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }

    async saveData(data, marketId) {
        const { exchange, symbol } = this;

        try {
            const {
                high,
                low,
                bid,
                bidVolume,
                ask,
                askVolume,
                vwap,
                open,
                close,
                last,
                previousClose,
                change,
                percentage,
                average,
                baseVolume,
                quoteVolume,
            } = data;

            await Ticker.create({
                marketId,
                high,
                low,
                bid,
                bidVolume,
                ask,
                askVolume,
                vwap,
                open,
                close,
                last,
                previousClose,
                change,
                percentage,
                average,
                baseVolume,
                quoteVolume,
            });

            this.logger.info(
                `Ticker for '${exchange} & ${symbol}' have been saved successfully`,
            );
        } catch (error) {
            this.logger.error({
                message: `Could not save Ticker for '${exchange} & ${symbol}'`,
                error,
            });
        }
    }
}
