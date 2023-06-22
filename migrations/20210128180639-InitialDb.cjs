module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Exchanges', {
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
        });

        await queryInterface.createTable('Markets', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            externalMarketId: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            symbol: { type: Sequelize.STRING, allowNull: false },
            base: { type: Sequelize.STRING, allowNull: false },
            quote: { type: Sequelize.STRING, allowNull: false },
            baseId: { type: Sequelize.STRING, allowNull: false },
            quoteId: { type: Sequelize.STRING, allowNull: false },
            active: { type: Sequelize.BOOLEAN, allowNull: false },
            exchangeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'Exchanges', key: 'id' },
            },
        });

        await queryInterface.createTable('OrderBooks', {
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
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('OrderBooks');
        await queryInterface.dropTable('Markets');
        await queryInterface.dropTable('Exchanges');
    },
};
