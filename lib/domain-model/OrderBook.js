import Base                from './Base.js';
import { DataTypes as DT } from './../../packages.js';
import Market              from './Market.js';


export default class OrderBook extends Base {
    static schema = {
        id        : { type: DT.INTEGER, primaryKey: true, autoIncrement: true  },
        marketId  : { type: DT.STRING, allowNull: false },
        bids      : { type: DT.ARRAY(DT.ARRAY(DT.INTEGER)), allowNull: false },
        asks      : { type: DT.ARRAY(DT.ARRAY(DT.INTEGER)), allowNull: false },
        createdAt : { type: DT.DATE, allowNull: false }
    }

    static options = {
        updatedAt : false
    }

    static initRelations() {
        this.belongsTo(Market, { foreignKey: 'marketId', targetKey: 'id', as: 'market' });
    }
}
