import Market from '#domain-model/entities/Market.js';
import CryptoMarketRepository from './CryptoMarketRepository.js';

class RealtimeCryptoMarketRepository extends CryptoMarketRepository {
    static async getQueueSize(externalExchangeId) {
        return Market.scope([
            {
                method: ['searchActiveByExchange', externalExchangeId],
            },
        ]).count();
    }

    static async getMarketIds(externalExchangeId) {
        const markets = await Market.scope([
            {
                method: ['searchActiveByExchange', externalExchangeId],
            },
        ]).findAll({
            attributes: ['id'],
        });

        return markets.map((market) => market.id);
    }
}

export default RealtimeCryptoMarketRepository;
