module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.createTable(
                'Exchanges',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    externalExchangeId: {
                        type: Sequelize.STRING,
                        allowNull: false,
                        unique: true,
                    },
                    name: { type: Sequelize.STRING, allowNull: false },
                },
                { transaction },
            );

            await queryInterface.createTable(
                'Markets',
                {
                    id: {
                        type: Sequelize.INTEGER,
                        primaryKey: true,
                        autoIncrement: true,
                    },
                    externalMarketId: {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },
                    symbol: { type: Sequelize.STRING, allowNull: false },
                    base: { type: Sequelize.STRING, allowNull: false },
                    quote: { type: Sequelize.STRING, allowNull: false },
                    baseId: { type: Sequelize.STRING, allowNull: false },
                    quoteId: { type: Sequelize.STRING, allowNull: false },
                    active: { type: Sequelize.BOOLEAN },
                    exchangeId: {
                        type: Sequelize.INTEGER,
                        allowNull: false,
                        references: { model: 'Exchanges', key: 'id' },
                    },
                },
                { transaction },
            );

            await queryInterface.addConstraint('Markets', {
                fields: ['symbol', 'exchangeId'],
                type: 'unique',
                name: 'unique_market_inside_exchange',
                transaction,
            });

            await queryInterface.createTable(
                'OrderBooks',
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
                    bids: {
                        type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)),
                        allowNull: false,
                    },
                    asks: {
                        type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)),
                        allowNull: false,
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                },
                { transaction },
            );

            await queryInterface.createTable(
                'Trades',
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
                    tradesInfo: {
                        type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)),
                        allowNull: true,
                    },
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                },
                { transaction },
            );

            await queryInterface.createTable(
                'Tickers',
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
                    high: { type: Sequelize.FLOAT, allowNull: true },
                    low: { type: Sequelize.FLOAT, allowNull: true },
                    bid: { type: Sequelize.FLOAT, allowNull: false },
                    bidVolume: { type: Sequelize.FLOAT, allowNull: true },
                    ask: { type: Sequelize.FLOAT, allowNull: false },
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
                    createdAt: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    },
                },
                { transaction },
            );

            await queryInterface.createTable(
                'CandleSticks',
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
                    charts: {
                        type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)),
                        allowNull: true,
                    },
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

    down: async (queryInterface) => {
        await queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable('Trades', { transaction });
            await queryInterface.dropTable('Tickers', { transaction });
            await queryInterface.dropTable('CandleSticks', { transaction });
            await queryInterface.dropTable('OrderBooks', { transaction });
            await queryInterface.removeConstraint(
                'Markets',
                'unique_market_inside_exchange',
                { transaction },
            );
            await queryInterface.dropTable('Markets', { transaction });
            await queryInterface.dropTable('Exchanges', { transaction });
        });
    },
};
