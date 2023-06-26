import { DataTypes as DT } from 'sequelize';
import Base from './Base.js';
import Market from './Market.js';

class Ticker extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        marketId: { type: DT.INTEGER, allowNull: false },
        high: { type: DT.FLOAT, allowNull: true },
        low: { type: DT.FLOAT, allowNull: true },
        bid: { type: DT.FLOAT, allowNull: true },
        bidVolume: { type: DT.FLOAT, allowNull: true },
        ask: { type: DT.FLOAT, allowNull: true },
        askVolume: { type: DT.FLOAT, allowNull: true },
        vwap: { type: DT.FLOAT, allowNull: true },
        open: { type: DT.FLOAT, allowNull: true },
        close: { type: DT.FLOAT, allowNull: true },
        last: { type: DT.FLOAT, allowNull: true },
        previousClose: { type: DT.FLOAT, allowNull: true },
        change: { type: DT.FLOAT, allowNull: true },
        percentage: { type: DT.FLOAT, allowNull: true },
        average: { type: DT.FLOAT, allowNull: true },
        baseVolume: { type: DT.FLOAT, allowNull: true },
        quoteVolume: { type: DT.FLOAT, allowNull: true },
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

export default Ticker;
