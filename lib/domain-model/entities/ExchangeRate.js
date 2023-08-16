import { DataTypes as DT } from 'sequelize';
import Base from './Base.js';
import Market from './Market.js';

class ExchangeRate extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        poolASize: { type: DT.DECIMAL(32, 8), allowNull: true },
        poolBSize: { type: DT.DECIMAL(32, 8), allowNull: true },
        exchangeRate: { type: DT.DECIMAL(64, 32), allowNull: true },
        intervalStart: { type: DT.DATE },
        intervalEnd: { type: DT.DATE },
        createdAt: { type: DT.DATE, allowNull: false },
    };

    static options = {
        updatedAt: false,
    };

    static initRelations() {
        this.belongsTo(Market, {
            foreignKey: 'marketId',
            targetKey: 'id',
            as: 'Market',
        });
    }
}

export default ExchangeRate;
