import Sequelize from 'sequelize';
import BaseEntity from '#domain-model/entities/BaseEntity.js';
import sequelizeTransactions from '../namespaces/sequelize-transactions.js';
import MODELS_LIST from './models-list.js';
import initSequelize from './initSequelize.js';

function initModels({ sequelizeOptions, config }) {
    Sequelize.useCLS(sequelizeTransactions);

    const sequelize = initSequelize(sequelizeOptions);

    MODELS_LIST.forEach((model) => {
        model.init(sequelize);
    });
    MODELS_LIST.forEach((model) => {
        model.initRelationsAndHooks(sequelize);
    });

    BaseEntity.setSequelize(sequelize);
    BaseEntity.setConfig(config);

    return sequelize;
}

export default initModels;
