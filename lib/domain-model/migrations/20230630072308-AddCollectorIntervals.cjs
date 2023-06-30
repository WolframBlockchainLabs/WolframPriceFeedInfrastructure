const COLLECTOR_TABLES = ['OrderBooks', 'Trades', 'Tickers', 'CandleSticks'];

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.addColumn(
                    table,
                    'intervalStart',
                    {
                        type: Sequelize.DATE,
                    },
                    { transaction },
                );

                await queryInterface.addColumn(
                    table,
                    'intervalEnd',
                    {
                        type: Sequelize.DATE,
                    },
                    { transaction },
                );
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.removeColumn(table, 'intervalStart', {
                    transaction,
                });

                await queryInterface.removeColumn(table, 'intervalEnd', {
                    transaction,
                });
            }
        });
    },
};
