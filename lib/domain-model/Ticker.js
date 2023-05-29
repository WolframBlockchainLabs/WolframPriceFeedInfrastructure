import { DataTypes as DT } from '../../packages.js';
import Base                from './Base.js';
import Market              from './Market.js';

export default class Ticker extends Base {
    static schema = {

        id            : { type: DT.INTEGER, primaryKey: true, autoIncrement: true  },
        marketId      : { type: DT.INTEGER, allowNull: false },
        high          : { type: DT.INTEGER, allowNull: false },
        low           : { type: DT.INTEGER, allowNull: false },
        bid           : { type: DT.INTEGER, allowNull: false },
        bidVolume     : { type: DT.INTEGER, allowNull: false },
        ask           : { type: DT.INTEGER, allowNull: false },
        askVolume     : { type: DT.INTEGER, allowNull: false },
        vwap          : { type: DT.INTEGER, allowNull: false },
        open          : { type: DT.INTEGER, allowNull: false },
        close         : { type: DT.INTEGER, allowNull: false },
        last          : { type: DT.INTEGER, allowNull: false },
        previousClose : { type: DT.INTEGER, allowNull: false },
        change        : { type: DT.INTEGER, allowNull: false },
        percentage    : { type: DT.INTEGER, allowNull: false },
        average       : { type: DT.INTEGER, allowNull: false },
        baseVolume    : { type: DT.INTEGER, allowNull: false },
        quoteVolume   : { type: DT.INTEGER, allowNull: false },
        createdAt     : { type: DT.DATE, allowNull: false }

    }

    static options = {
        updatedAt : false
    }

    static initRelations() {
        this.belongsTo(Market, { foreignKey: 'marketId', targetKey: 'id', as: 'market' });
    }
}
