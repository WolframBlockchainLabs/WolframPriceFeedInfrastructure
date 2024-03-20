import { DataTypes as DT } from 'sequelize';
import BaseMarketRecordEntity from './BaseMarketRecordEntity.js';

class Trade extends BaseMarketRecordEntity {
    static schema = {
        id: { type: DT.BIGINT, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        tradesInfo: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: true },
        intervalStart: { type: DT.DATE, allowNull: false },
        intervalEnd: { type: DT.DATE, allowNull: false },
        createdAt: { type: DT.DATE, allowNull: false },
    };

    static options = {
        ...BaseMarketRecordEntity.options,
        indexes: [
            {
                name: 'Trades_unique_interval_market',
                unique: true,
                fields: ['intervalStart', 'intervalEnd', 'marketId'],
            },
        ],
    };
}

export default Trade;
