module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('DiscreteAggregationExchanges', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            discreteAggregationResultId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'DiscreteAggregationResults',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            exchangeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Exchanges',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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

        await queryInterface.addIndex(
            'DiscreteAggregationExchanges',
            ['discreteAggregationResultId'],
            {
                name: 'dae_discreteAggregationResultId_idx',
            },
        );

        await queryInterface.addIndex(
            'DiscreteAggregationExchanges',
            ['exchangeId'],
            {
                name: 'dae_exchangeId_idx',
            },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('DiscreteAggregationExchanges');
    },
};
