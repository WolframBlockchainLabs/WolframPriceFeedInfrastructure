class BaseMarketRepository {
    static async getQueueSize() {
        throw new Error(
            `[${this.name}]: getQueueSize method is not implemented`,
        );
    }

    static async getMarketIds() {
        throw new Error(
            `[${this.name}]: getMarketIds method is not implemented`,
        );
    }

    static async getMarketContext() {
        throw new Error(
            `[${this.name}]: getMarketContext method is not implemented`,
        );
    }

    static dumpMarket(market) {
        return {
            id: market.id,
            taskName: market.taskName,
            externalExchangeId: market.externalExchangeId,
            symbol: market.symbol,
            pair: market.pair,
        };
    }
}

export default BaseMarketRepository;
