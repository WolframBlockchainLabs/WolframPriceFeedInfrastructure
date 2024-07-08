import BaseEntity from './BaseEntity.js';
import Exchange from './Exchange.js';
import { DataTypes as DT } from 'sequelize';
import OrderBook from './market-records/OrderBook.js';
import CandleStick from './market-records/CandleStick.js';
import Ticker from './market-records/Ticker.js';
import Trade from './market-records/Trade.js';
import ExchangeRate from './market-records/ExchangeRate.js';

class Market extends BaseEntity {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        externalMarketId: { type: DT.STRING, allowNull: false },
        symbol: { type: DT.STRING, allowNull: false },
        base: { type: DT.STRING, allowNull: false },
        quote: { type: DT.STRING, allowNull: false },
        baseId: { type: DT.STRING, allowNull: false },
        quoteId: { type: DT.STRING, allowNull: false },
        meta: { type: DT.JSONB, allowNull: true },
        baseMeta: { type: DT.JSONB, allowNull: true },
        quoteMeta: { type: DT.JSONB, allowNull: true },
        active: { type: DT.BOOLEAN, allowNull: false, defaultValue: false },
        historical: { type: DT.BOOLEAN, allowNull: false, defaultValue: false },
    };

    static options = {
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
                name: 'unique_market_inside_exchange',
                unique: true,
                fields: ['symbol', 'exchangeId'],
            },
        ],
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
        this.hasMany(ExchangeRate, {
            foreignKey: 'marketId',
            sourceKey: 'id',
            as: 'ExchangeRate',
        });
    }
}

export default Market;
