/* eslint-disable max-lines-per-function */
// eslint-disable-next-line import/no-commonjs
module.exports = {
    up : async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Exchange', {
            id          : { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
            name        : { type: Sequelize.STRING, allowNull: false, unique: true },
            description : { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            createdAt   : { type: Sequelize.DATE,   allowNull: false },
            updatedAt   : { type: Sequelize.DATE,   allowNull: false }
        }, {
            charset : 'utf8mb4'
        });
    },

    down : async (queryInterface) => {
        await queryInterface.dropTable('Exchange');

    }
};
