module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('AggregationTasks', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            type: {
                type: Sequelize.ENUM(
                    'CANDLES_DISCRETE_AGGREGATION',
                    'CANDLES_COMPLETE_AGGREGATION',
                ),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    'PENDING',
                    'PROCESSING',
                    'COMPLETED',
                    'ERROR',
                ),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            context: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            error: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('AggregationTasks');
    },
};
