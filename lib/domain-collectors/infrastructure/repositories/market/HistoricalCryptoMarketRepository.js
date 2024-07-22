import Market from '#domain-model/entities/Market.js';
import CryptoMarketRepository from './CryptoMarketRepository.js';

class HistoricalCryptoMarketRepository extends CryptoMarketRepository {
    static async getQueueSize(externalExchangeId) {
        return Market.scope([
            {
                method: ['searchHistoricalByExchange', externalExchangeId],
            },
        ]).count();
    }

    static async getMarketIds(externalExchangeId) {
        const markets = await Market.scope([
            {
                method: ['searchHistoricalByExchange', externalExchangeId],
            },
        ]).findAll({
            attributes: ['id'],
        });

        return markets.map((market) => market.id);
    }
}

export default HistoricalCryptoMarketRepository;
