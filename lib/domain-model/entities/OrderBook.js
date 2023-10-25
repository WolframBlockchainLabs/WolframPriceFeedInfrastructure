import Base from './Base.js';
import { DataTypes as DT } from 'sequelize';
import Market from './Market.js';

class OrderBook extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        bids: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: true },
        asks: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: true },
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

export default OrderBook;
