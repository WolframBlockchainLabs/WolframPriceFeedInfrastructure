import { DataTypes as DT } from '../../packages.js';
import Base                from './Base.js';
import Market              from './Market.js';

export default class Trade extends Base {
    static schema = {
        id        : { type: DT.INTEGER, primaryKey: true, autoIncrement: true  },
        marketId  : { type: DT.INTEGER, allowNull: false },
        side      : { type: DT.BOOLEAN, allowNull: false },
        price     : { type: DT.FLOAT, allowNull: false },
        amount    : { type: DT.FLOAT, allowNull: false },
        timestamp : { type: DT.INTEGER, allowNull: false },
        createdAt : { type: DT.DATE, allowNull: false }
    }

    static options = {
        updatedAt : false
    }

    static initRelations() {
        this.belongsTo(Market, { foreignKey: 'marketId', targetKey: 'id', as: 'market' });
    }
}
