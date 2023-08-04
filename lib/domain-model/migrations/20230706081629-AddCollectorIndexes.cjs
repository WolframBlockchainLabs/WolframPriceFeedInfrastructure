const COLLECTOR_TABLES = ['OrderBooks', 'Trades', 'Tickers', 'CandleSticks'];

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.addIndex(table, ['createdAt'], {
                    transaction,
                });
                await queryInterface.addIndex(
                    table,
                    ['intervalStart', 'intervalEnd'],
                    { transaction },
                );
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.removeIndex(table, ['createdAt'], {
                    transaction,
                });
                await queryInterface.removeIndex(
                    table,
                    ['intervalStart', 'intervalEnd'],
                    { transaction },
                );
            }
        });
    },
};
