import ccxt from 'ccxt';

export default class Collector {
    constructor({ logger, exchange, symbol, marketId }) {
        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.marketId = marketId;
        this.exchangeAPI = new ccxt[exchange]();
    }

    async start() {
        const { exchange, symbol, marketId } = this;

        this.logger.info(`Collector for '${exchange}' ${symbol} is running`);

        try {
            const data = await this.fetchData();

            await this.saveData(data, marketId);
        } catch (error) {
            this.logger.error('Collector has finished with error', error);
        }
    }

    async fetchData() {}

    async saveData() {}
}
