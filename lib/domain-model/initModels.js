import cls from 'cls-hooked';
import Sequelize from 'sequelize';
import Exchange from './entities/Exchange.js';
import Market from './entities/Market.js';
import OrderBook from './entities/OrderBook.js';
import Trade from './entities/Trade.js';
import Ticker from './entities/Ticker.js';
import CandleStick from './entities/CandleStick.js';

export default function initModels(dbConfig, params) {
    const { database, username, password, dialect, host, port } = dbConfig;
    const retriesDefault = 4;

    Sequelize.useCLS(cls.createNamespace('sequelize-transactions-namespace'));

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
    };

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
