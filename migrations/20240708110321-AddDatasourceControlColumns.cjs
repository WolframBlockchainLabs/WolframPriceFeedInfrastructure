module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Exchanges', 'dataSource', {
            type: Sequelize.STRING,
            allowNull: false,
        });

        await queryInterface.addColumn('Markets', 'meta', {
            type: Sequelize.JSONB,
            allowNull: true,
        });
        await queryInterface.addColumn('Markets', 'baseMeta', {
            type: Sequelize.JSONB,
            allowNull: true,
        });
        await queryInterface.addColumn('Markets', 'quoteMeta', {
            type: Sequelize.JSONB,
            allowNull: true,
        });
        await queryInterface.addColumn('Markets', 'historical', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        await queryInterface.changeColumn('Markets', 'active', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Exchanges', 'dataSource');

        await queryInterface.removeColumn('Markets', 'meta');
        await queryInterface.removeColumn('Markets', 'baseMeta');
        await queryInterface.removeColumn('Markets', 'quoteMeta');
        await queryInterface.removeColumn('Markets', 'historical');

        await queryInterface.changeColumn('Markets', 'active', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        });
    },
};
