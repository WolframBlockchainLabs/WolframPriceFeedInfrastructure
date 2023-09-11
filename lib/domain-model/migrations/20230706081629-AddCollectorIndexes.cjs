const COLLECTOR_TABLES = ['OrderBooks', 'Trades', 'Tickers', 'CandleSticks'];

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.sequelize.query(
                    `
                    DELETE FROM "${table}" a
                    USING "${table}" b
                    WHERE
                        a.id > b.id
                        AND a."intervalStart" = b."intervalStart" 
                        AND a."intervalEnd" = b."intervalEnd"
                        AND a."marketId" = b."marketId";
                `,
                    { transaction },
                );

                await queryInterface.addIndex(
                    table,
                    ['intervalStart', 'intervalEnd', 'marketId'],
                    {
                        unique: true,
                        name: `${table}_unique_interval_market`,
                        transaction,
                    },
                );
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (transaction) => {
            for (const table of COLLECTOR_TABLES) {
                await queryInterface.removeIndex(
                    table,
                    `${table}_unique_interval_market`,
                    { transaction },
                );
            }
        });
    },
};
