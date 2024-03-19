module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('CandleSticks', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            marketId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Markets', key: 'id' },
            },
            charts: {
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
            'CandleSticks',
            ['marketId', 'intervalStart', 'intervalEnd'],
            {
                unique: true,
                name: 'CandleSticks_unique_interval_market',
            },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex(
            'CandleSticks',
            'CandleSticks_unique_interval_market',
        );

        await queryInterface.dropTable('CandleSticks');
    },
};
