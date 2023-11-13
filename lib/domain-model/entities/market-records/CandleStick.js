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
}

export default CandleStick;
