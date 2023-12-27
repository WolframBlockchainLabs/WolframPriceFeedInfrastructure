module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ExchangeRates', {
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
            poolASize: {
                type: Sequelize.DECIMAL(64, 32),
                allowNull: true,
            },
            poolBSize: {
                type: Sequelize.DECIMAL(64, 32),
                allowNull: true,
            },
            exchangeRate: {
                type: Sequelize.DECIMAL(64, 32),
                allowNull: true,
            },
            intervalStart: { type: Sequelize.DATE, allowNull: false },
            intervalEnd: { type: Sequelize.DATE, allowNull: false },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex(
            'ExchangeRates',
            ['intervalStart', 'intervalEnd', 'marketId'],
            {
                unique: true,
                name: `ExchangeRates_unique_interval_market`,
            },
        );
    },

    async down(queryInterface) {
        await queryInterface.removeIndex(
            'ExchangeRates',
            `ExchangeRates_unique_interval_market`,
        );

        await queryInterface.dropTable('ExchangeRates');
    },
};
