import Sequelize from 'sequelize';

function initSequelize(sequelizeOptions) {
    const { database, username, password, retry, ...options } =
        sequelizeOptions;

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

    return sequelize;
}

export default initSequelize;
