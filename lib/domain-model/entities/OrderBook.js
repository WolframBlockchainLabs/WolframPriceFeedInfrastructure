import Base from './Base.js';
import { DataTypes as DT } from 'sequelize';
import Market from './Market.js';

class OrderBook extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        bids: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: false },
        asks: { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: false },
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
