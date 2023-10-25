import Base from './Base.js';
import Exchange from './Exchange.js';
import { DataTypes as DT } from 'sequelize';
import OrderBook from './OrderBook.js';
import CandleStick from './CandleStick.js';
import Ticker from './Ticker.js';
import Trade from './Trade.js';

class Market extends Base {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        externalMarketId: { type: DT.STRING, allowNull: false },
        symbol: { type: DT.STRING, allowNull: false },
        base: { type: DT.STRING, allowNull: false },
        quote: { type: DT.STRING, allowNull: false },
        baseId: { type: DT.STRING, allowNull: false },
        quoteId: { type: DT.STRING, allowNull: false },
        active: { type: DT.BOOLEAN, allowNull: true },
    };

    static options = {
        createdAt: false,
        updatedAt: false,
    };

    static initRelations() {
        this.belongsTo(Exchange, {
            foreignKey: 'exchangeId',
            targetKey: 'id',
            as: 'Exchange',
        });
        this.hasMany(OrderBook, {
            foreignKey: 'marketId',
            sourceKey: 'id',
            as: 'OrderBook',
        });
        this.hasMany(CandleStick, {
            foreignKey: 'marketId',
            sourceKey: 'id',
            as: 'CandleStick',
        });
        this.hasMany(Ticker, {
            foreignKey: 'marketId',
            sourceKey: 'id',
            as: 'Ticker',
        });
        this.hasMany(Trade, {
            foreignKey: 'marketId',
            sourceKey: 'id',
            as: 'Trade',
        });
    }
}

export default Market;
