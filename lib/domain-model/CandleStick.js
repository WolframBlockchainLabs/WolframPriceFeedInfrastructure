import { DataTypes as DT } from '../../packages.js';
import Base                from './Base.js';
import Market              from './Market.js';

export default class CandleStick extends Base {
    static schema = {
        id        : { type: DT.INTEGER, primaryKey: true, autoIncrement: true  },
        marketId  : { type: DT.INTEGER, allowNull: false },
        candles   : { type: DT.ARRAY(DT.ARRAY(DT.FLOAT)), allowNull: false },
        createdAt : { type: DT.DATE, allowNull: false }
    }

    static options = {
        updatedAt : false
    }

    static initRelations() {
        this.belongsTo(Market, { foreignKey: 'marketId', targetKey: 'id', as: 'market' });
    }
}
