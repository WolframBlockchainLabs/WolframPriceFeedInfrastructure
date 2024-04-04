module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('DiscreteAggregationResults', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            symbol: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            processedCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            count: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            rangeDateStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            rangeDateEnd: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            timeframeMinutes: {
                type: Sequelize.SMALLINT,
                allowNull: false,
            },
            candles: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            taskId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'AggregationTasks',
                    key: 'id',
                },
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        await queryInterface.addIndex(
            'DiscreteAggregationResults',
            ['rangeDateStart', 'rangeDateEnd', 'symbol'],
            {
                name: 'DiscreteAggregationResults_range_search_idx',
            },
        );

        await queryInterface.addIndex(
            'DiscreteAggregationResults',
            ['symbol'],
            {
                name: 'DiscreteAggregationResults_symbol_key',
            },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex(
            'DiscreteAggregationResults',
            'DiscreteAggregationResults_range_search_idx',
        );
        await queryInterface.removeIndex(
            'DiscreteAggregationResults',
            'DiscreteAggregationResults_symbol_key',
        );

        await queryInterface.dropTable('DiscreteAggregationResults');
    },
};
