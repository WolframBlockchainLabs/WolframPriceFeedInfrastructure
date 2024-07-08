module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Exchanges', 'dataSource', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'default_source',
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

        await queryInterface.removeColumn('Markets', 'active');

        await queryInterface.addColumn('Markets', 'active', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Markets', 'active');

        await queryInterface.addColumn('Markets', 'active', {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        });

        await queryInterface.removeColumn('Markets', 'historical');
        await queryInterface.removeColumn('Markets', 'quoteMeta');
        await queryInterface.removeColumn('Markets', 'baseMeta');
        await queryInterface.removeColumn('Markets', 'meta');

        await queryInterface.removeColumn('Exchanges', 'dataSource');
    },
};
