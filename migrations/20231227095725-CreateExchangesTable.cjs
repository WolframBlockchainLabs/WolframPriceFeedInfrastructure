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
            },
            name: { type: Sequelize.STRING, allowNull: false },
        });

        await queryInterface.addIndex('Exchanges', ['name'], {
            name: 'Exchanges_name_idx',
        });

        await queryInterface.addIndex('Exchanges', ['externalExchangeId'], {
            unique: true,
            name: 'Exchanges_externalExchangeId_key',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex(
            'Exchanges',
            'Exchanges_externalExchangeId_key',
        );

        await queryInterface.removeIndex('Exchanges', 'Exchanges_name_idx');

        await queryInterface.dropTable('Exchanges');
    },
};
