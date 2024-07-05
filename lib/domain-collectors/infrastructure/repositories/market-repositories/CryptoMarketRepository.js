import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import BaseMarketRepository from './BaseMarketRepository.js';

class CryptoMarketRepository extends BaseMarketRepository {
    static async getMarketContext(marketId) {
        const market = await Market.findByPk(marketId, {
            include: [Exchange],
        });

        return this.dumpMarket(market);
    }
}

export default CryptoMarketRepository;
