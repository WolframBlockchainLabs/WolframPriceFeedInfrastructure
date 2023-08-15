import { DataTypes as DT } from 'sequelize';
import Base from './Base.js';
import Market from './Market.js';

class ExchangeRate extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        poolASize: { type: DT.INTEGER, allowNull: true },
        poolBSize: { type: DT.INTEGER, allowNull: true },
        exchangeRate: { type: DT.INTEGER, allowNull: true },
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
