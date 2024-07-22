import Exchange from '#domain-model/entities/Exchange.js';
import BaseExchangeRepository from './BaseExchangeRepository.js';

class CryptoExchangeRepository extends BaseExchangeRepository {
    static async getDataSource(externalExchangeId) {
        const targetExchange = await Exchange.findOneOrFail({
            where: {
                externalExchangeId,
            },
            attributes: ['dataSource'],
        });

        return targetExchange.dataSource;
    }

    static async getDataSourceGroupMembers(dataSource) {
        const groupExchanges = await Exchange.findAll({
            where: {
                dataSource,
            },
            attributes: ['externalExchangeId'],
        });

        return groupExchanges.map((exchange) => exchange.externalExchangeId);
    }
}

export default CryptoExchangeRepository;
