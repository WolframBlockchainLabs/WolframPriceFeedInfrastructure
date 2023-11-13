import { DataTypes as DT } from 'sequelize';
import BaseMarketRecordEntity from './BaseMarketRecordEntity.js';

class ExchangeRate extends BaseMarketRecordEntity {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        poolASize: { type: DT.DECIMAL(32, 8), allowNull: true },
        poolBSize: { type: DT.DECIMAL(32, 8), allowNull: true },
        exchangeRate: { type: DT.DECIMAL(64, 32), allowNull: true },
        intervalStart: { type: DT.DATE, allowNull: false },
        intervalEnd: { type: DT.DATE, allowNull: false },
        createdAt: { type: DT.DATE, allowNull: false },
    };
}

export default ExchangeRate;
