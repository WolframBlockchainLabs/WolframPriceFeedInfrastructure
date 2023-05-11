import cls                     from 'cls-hooked';
import Sequelize               from 'sequelize';
import StoredTriggerableAction from './StoredTriggerableAction.js';
import User                    from './User.js';


Sequelize.useCLS(cls.createNamespace('sequelize-transactions-namespace'));

const retriesDefault = 4;

export function initModels(dbConfig, params) {
    const { database, username, password, dialect, host, port } = dbConfig;

    const sequelize = new Sequelize(database, username, password, {
        host,
        port,
        dialect,
        logging        : false,
        dialectOptions : {
            connectTimeout : 10000,
            timezone       : 'local'
        },
        // timezone : 'Europe/Kiev',
        pool : {
            min     : 5,
            max     : 50,
            idle    : 10000, // The maximum time, in milliseconds, that a connection can be idle before being released.
            acquire : 120000 // ..., that pool will try to get connection before throwing error
        },
        retry : { // Set of flags that control when a query is automatically retried.
            match : [
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/,
                /TimeoutError/,
                /SequelizeDatabaseError/
            ],
            max : params && params.maxRetries ? +params.maxRetries : retriesDefault
        }
    });

    const models = {
        StoredTriggerableAction,
        User,

    };

    Object.values(models).forEach(model => {
        model.init(sequelize);
    });
    Object.values(models).forEach(model => model.initRelationsAndHooks(sequelize));

    return {
        ...models,
        sequelize
    };
}

export function setLangConfig(options) {
    Translation.setLangConfig(options);
}
