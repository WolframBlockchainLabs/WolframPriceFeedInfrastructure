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
        meta: { type: DT.JSONB, allowNull: true },
        active: { type: DT.BOOLEAN, allowNull: false, defaultValue: false },
        historical: { type: DT.BOOLEAN, allowNull: false, defaultValue: false },
        base: { type: DT.STRING, allowNull: false },
        baseId: { type: DT.STRING, allowNull: false },
        baseMeta: { type: DT.JSONB, allowNull: true },
        quote: { type: DT.STRING, allowNull: false },
        quoteId: { type: DT.STRING, allowNull: false },
        quoteMeta: { type: DT.JSONB, allowNull: true },
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
        scopes: {
            searchActiveByExchange(externalExchangeId) {
                return {
                    include: [
                        {
                            model: Exchange,
                            attributes: [],
                            where: {
                                externalExchangeId,
                            },
                        },
                    ],
                    where: {
                        active: true,
                    },
                };
            },
            searchHistoricalByExchange(externalExchangeId) {
                return {
                    include: [
                        {
                            model: Exchange,
                            attributes: [],
                            where: {
                                externalExchangeId,
                            },
                        },
                    ],
                    where: {
                        historical: true,
                    },
                };
            },
        },
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

    get externalExchangeId() {
        return this.Exchange.externalExchangeId;
    }

    get dataSource() {
        return this.Exchange.dataSource;
    }

    get taskName() {
        return `${this.externalExchangeId}::${this.externalMarketId}`;
    }

    get pair() {
        return {
            meta: this.meta,
            in: {
                symbol: this.base,
                name: this.baseId,
                meta: this.baseMeta,
            },
            out: {
                symbol: this.quote,
                name: this.quoteId,
                meta: this.quoteMeta,
            },
        };
    }
}

export default Market;
