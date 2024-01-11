import { DataTypes as DT } from 'sequelize';
import BaseMarketRecordEntity from './BaseMarketRecordEntity.js';

class CandleStick extends BaseMarketRecordEntity {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        charts: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: true },
        intervalStart: { type: DT.DATE, allowNull: false },
        intervalEnd: { type: DT.DATE, allowNull: false },
        createdAt: { type: DT.DATE, allowNull: false },
    };

    static options = {
        ...BaseMarketRecordEntity.options,
        indexes: [
            {
                name: 'CandleSticks_unique_interval_market',
                unique: true,
                fields: ['intervalStart', 'intervalEnd', 'marketId'],
            },
        ],
    };
}

export default CandleStick;
