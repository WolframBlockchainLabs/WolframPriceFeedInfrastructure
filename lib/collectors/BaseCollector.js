class BaseCollector {
    constructor({ logger, exchange, symbol, marketId, exchangeAPI }) {
        this.logger = logger;
        this.exchange = exchange;
        this.symbol = symbol;
        this.marketId = marketId;
        this.exchangeAPI = exchangeAPI;
    }

    async start() {
        const { exchange, symbol, marketId } = this;

        this.logger.info(`Collector for '${exchange} & ${symbol}' is running`);

        try {
            const data = await this.fetchData();
            if (!data) return;

            await this.saveData(data, marketId);
        } catch (error) {
            this.logger.error({
                message: `'${exchange} & ${symbol}' Collector has finished with an error`,
                error,
            });
        }
    }

    /* c8 ignore next */
    async fetchData() {}

    /* c8 ignore next */
    async saveData() {}
}

export default BaseCollector;
