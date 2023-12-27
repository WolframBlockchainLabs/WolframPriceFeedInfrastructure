module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Markets', {
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
        });

        await queryInterface.addConstraint('Markets', {
            fields: ['symbol', 'exchangeId'],
            type: 'unique',
            name: 'unique_market_inside_exchange',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeConstraint(
            'Markets',
            'unique_market_inside_exchange',
        );

        await queryInterface.dropTable('Markets');
    },
};
