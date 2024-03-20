module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Trades', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            marketId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Markets', key: 'id' },
            },
            tradesInfo: {
                type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)),
                allowNull: true,
            },
            intervalStart: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            intervalEnd: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex(
            'Trades',
            ['marketId', 'intervalStart', 'intervalEnd'],
            {
                unique: true,
                name: 'Trades_unique_interval_market',
            },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex(
            'Trades',
            'Trades_unique_interval_market',
        );

        await queryInterface.dropTable('Trades');
    },
};
