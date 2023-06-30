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

                await queryInterface.addConstraint(table, {
                    fields: ['intervalStart', 'intervalEnd'],
                    type: 'unique',
                    name: `${table}_interval_dates_unique_constraint`,
                    transaction,
                });
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.removeConstraint(
                    table,
                    `${table}_interval_dates_unique_constraint`,
                    { transaction },
                );

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
