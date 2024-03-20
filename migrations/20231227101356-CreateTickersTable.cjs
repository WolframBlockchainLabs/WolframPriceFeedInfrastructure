module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Tickers', {
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
            high: { type: Sequelize.FLOAT, allowNull: true },
            low: { type: Sequelize.FLOAT, allowNull: true },
            bid: { type: Sequelize.FLOAT, allowNull: true },
            bidVolume: { type: Sequelize.FLOAT, allowNull: true },
            ask: { type: Sequelize.FLOAT, allowNull: true },
            askVolume: { type: Sequelize.FLOAT, allowNull: true },
            vwap: { type: Sequelize.FLOAT, allowNull: true },
            open: { type: Sequelize.FLOAT, allowNull: true },
            close: { type: Sequelize.FLOAT, allowNull: true },
            last: { type: Sequelize.FLOAT, allowNull: true },
            previousClose: { type: Sequelize.FLOAT, allowNull: true },
            change: { type: Sequelize.FLOAT, allowNull: true },
            percentage: { type: Sequelize.FLOAT, allowNull: true },
            average: { type: Sequelize.FLOAT, allowNull: true },
            baseVolume: { type: Sequelize.FLOAT, allowNull: true },
            quoteVolume: { type: Sequelize.FLOAT, allowNull: true },
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
            'Tickers',
            ['marketId', 'intervalStart', 'intervalEnd'],
            {
                unique: true,
                name: 'Tickers_unique_interval_market',
            },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex(
            'Tickers',
            'Tickers_unique_interval_market',
        );

        await queryInterface.dropTable('Tickers');
    },
};
