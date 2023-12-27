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
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('Exchanges');
    },
};
