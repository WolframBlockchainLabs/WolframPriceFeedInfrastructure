import Trade from '../../domain-model/entities/Trade.js';
import Collector from '../Base.js';

export class TradeCollector extends Collector {
    async fetchData() {
        const { exchangeAPI, symbol } = this;

        await exchangeAPI.loadMarkets();

        // eslint-disable-next-line no-magic-numbers
        const sinceTime = exchangeAPI.milliseconds() - 60000;

        try {
            const fetchedData = await exchangeAPI.fetchTrades(
                symbol,
                sinceTime,
            );

            const data = fetchedData.map((element) => {
                const { side, price, amount, timestamp } = element;

                const sideNum = +(side === 'sell');

                return [sideNum, price, amount, timestamp];
            });

            return data;
        } catch (error) {
            this.logger.error(
                `Trades did not receive from ${exchangeAPI.name} for ${symbol} market`,
                error,
            );
        }
    }

    async saveData(tradesInfo, marketId) {
        const { exchange, symbol } = this;

        try {
            await Trade.create({
                marketId,
                tradesInfo,
            });

            this.logger.info('Data have saved successfully');
        } catch (error) {
            this.logger.error(
                `Trade did not save for ${exchange} and ${symbol} market`,
                error,
            );
        }
    }
}
