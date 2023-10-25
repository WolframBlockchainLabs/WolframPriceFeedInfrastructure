import { DataTypes as DT } from 'sequelize';
import Base from './Base.js';
import Market from './Market.js';

class CandleStick extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        charts: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: true },
        intervalStart: { type: DT.DATE, allowNull: true },
        intervalEnd: { type: DT.DATE, allowNull: true },
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

export default CandleStick;
