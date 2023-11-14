import Sequelize from 'sequelize';
import Exchange from '../../domain-model/entities/Exchange.js';
import Market from '../../domain-model/entities/Market.js';
import OrderBook from '../../domain-model/entities/market-records/OrderBook.js';
import Trade from '../../domain-model/entities/market-records/Trade.js';
import Ticker from '../../domain-model/entities/market-records/Ticker.js';
import CandleStick from '../../domain-model/entities/market-records/CandleStick.js';
import ExchangeRate from '../../domain-model/entities/market-records/ExchangeRate.js';
import BaseEntity from '../../domain-model/entities/BaseEntity.js';
import sequelizeTransactions from '../namespaces/sequelize-transactions.js';

function initModels(dbConfig, params) {
    const { database, username, password, dialect, host, port } = dbConfig;
    const retriesDefault = 4;

    Sequelize.useCLS(sequelizeTransactions);

    const sequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect,
        logging: false,
        dialectOptions: {
            connectTimeout: 10000,
            timezone: 'local',
        },
        pool: {
            min: 5,
            max: 50,
            idle: 10000, // The maximum time, in milliseconds, that a connection can be idle before being released.
            acquire: 120000, // ..., that pool will try to get connection before throwing error
        },
        retry: {
            // Set of flags that control when a query is automatically retried.
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
            max:
                params && params.maxRetries
                    ? +params.maxRetries
                    : retriesDefault,
        },
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

    BaseEntity.sequelize = sequelize;

    Object.values(models).forEach((model) => {
        model.init(sequelize);
    });
    Object.values(models).forEach((model) =>
        model.initRelationsAndHooks(sequelize),
    );

    return {
        ...models,
        sequelize,
    };
}

export default initModels;
