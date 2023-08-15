module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.createTable(
                'ExchangeRates',
                {
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
                    poolASize: { type: Sequelize.INTEGER, allowNull: true },
                    poolBSize: { type: Sequelize.INTEGER, allowNull: true },
                    exchangeRate: { type: Sequelize.INTEGER, allowNull: true },
                    intervalStart: { type: Sequelize.DATE, allowNull: false },
                    intervalEnd: { type: Sequelize.DATE, allowNull: false },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                },
                { transaction },
            );
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable('ExchangeRates', { transaction });
        });
    },
};
