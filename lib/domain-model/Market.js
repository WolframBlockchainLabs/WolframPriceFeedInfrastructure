import Base                from './Base.js';
import Exchange            from './Exchange.js';
import OrderBook           from './OrderBook.js';
import { DataTypes as DT } from './../../packages.js';

export default class Market extends Base {
    static schema = {
        id               : { type: DT.INTEGER, primaryKey: true, autoIncrement: true  },
        externalMarketId : { type: DT.STRING, allowNull: false },
        symbol           : { type: DT.STRING, allowNull: false },
        base             : { type: DT.STRING, allowNull: false  },
        quote            : { type: DT.STRING, allowNull: false  },
        baseId           : { type: DT.STRING, allowNull: false  },
        quoteId          : { type: DT.STRING, allowNull: false  },
        active           : { type: DT.BOOLEAN, allowNull: false  }
    }

    static options = {
        createdAt : false,
        updatedAt : false
    }

    static initRelations() {
        this.belongsTo(Exchange, { foreignKey: 'exchangeId', targetKey: 'id', as: 'exchange' });
        this.hasMany(OrderBook, { foreignKey: 'marketId', sourceKey: 'id', as: 'orderBook' });
    }
}
