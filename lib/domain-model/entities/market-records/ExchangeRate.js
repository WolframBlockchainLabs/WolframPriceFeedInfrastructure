import { DataTypes as DT } from 'sequelize';
import BaseMarketRecordEntity from './BaseMarketRecordEntity.js';

class ExchangeRate extends BaseMarketRecordEntity {
    static schema = {
        id: { type: DT.BIGINT, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        poolASize: { type: DT.DECIMAL(32, 8), allowNull: true },
        poolBSize: { type: DT.DECIMAL(32, 8), allowNull: true },
        exchangeRate: { type: DT.DECIMAL(64, 32), allowNull: true },
        intervalStart: { type: DT.DATE, allowNull: false },
        intervalEnd: { type: DT.DATE, allowNull: false },
        createdAt: { type: DT.DATE, allowNull: false },
    };

    static options = {
        ...BaseMarketRecordEntity.options,
        indexes: [
            {
                name: 'ExchangeRates_unique_interval_market',
                unique: true,
                fields: ['intervalStart', 'intervalEnd', 'marketId'],
            },
        ],
    };
}

export default ExchangeRate;
