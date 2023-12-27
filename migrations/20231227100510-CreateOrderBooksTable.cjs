module.exports = {
    up: async (queryInterface, Sequelize) => {
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
                allowNull: true,
            },
            asks: {
                type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)),
                allowNull: true,
            },
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
            'OrderBooks',
            ['intervalStart', 'intervalEnd', 'marketId'],
            {
                unique: true,
                name: 'OrderBooks_unique_interval_market',
            },
        );
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex(
            'OrderBooks',
            'OrderBooks_unique_interval_market',
        );

        await queryInterface.dropTable('OrderBooks');
    },
};
