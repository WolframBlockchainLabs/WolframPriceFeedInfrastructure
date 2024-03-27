import Sequelize from 'sequelize';
import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import OrderBook from '#domain-model/entities/market-records/OrderBook.js';
import Trade from '#domain-model/entities/market-records/Trade.js';
import Ticker from '#domain-model/entities/market-records/Ticker.js';
import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import ExchangeRate from '#domain-model/entities/market-records/ExchangeRate.js';
import BaseEntity from '#domain-model/entities/BaseEntity.js';
import sequelizeTransactions from '../namespaces/sequelize-transactions.js';

function initModels(dbConfig) {
    const { database, username, password, retry, ...options } = dbConfig;

    Sequelize.useCLS(sequelizeTransactions);

    const sequelize = new Sequelize(database, username, password, {
        logging: false,
        retry: {
            match: [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /TimeoutError/,
                /SequelizeDatabaseError/,
            ],
            ...retry,
        },
        ...options,
    });

    const models = {
        Exchange,
        Market,
        OrderBook,
        Trade,
        Ticker,
        CandleStick,
        ExchangeRate,
    };

    Object.values(models).forEach((model) => {
        model.init(sequelize);
    });
    Object.values(models).forEach((model) =>
        model.initRelationsAndHooks(sequelize),
    );

    BaseEntity.setSequelize(sequelize);

    return {
        ...models,
        sequelize,
    };
}

export default initModels;
