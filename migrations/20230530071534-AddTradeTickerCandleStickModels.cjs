// eslint-disable-next-line import/no-commonjs
module.exports = {
    up : async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Trades', {
            id         : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true  },
            marketId   : { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Markets', key: 'id' } },
            // side      : { type: Sequelize.BOOLEAN, allowNull: false },
            // price     : { type: Sequelize.FLOAT, allowNull: false },
            // amount    : { type: Sequelize.FLOAT, allowNull: false },
            // timestamp : { type: Sequelize.INTEGER, allowNull: false },
            tradesInfo : { type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)), allowNull: true },
            createdAt  : { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        await queryInterface.createTable('Tickers', {
            id            : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true  },
            marketId      : { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Markets', key: 'id' } },
            high          : { type: Sequelize.FLOAT, allowNull: true },
            low           : { type: Sequelize.FLOAT, allowNull: true },
            bid           : { type: Sequelize.FLOAT, allowNull: false },
            bidVolume     : { type: Sequelize.FLOAT, allowNull: true },
            ask           : { type: Sequelize.FLOAT, allowNull: false },
            askVolume     : { type: Sequelize.FLOAT, allowNull: true },
            vwap          : { type: Sequelize.FLOAT, allowNull: true },
            open          : { type: Sequelize.FLOAT, allowNull: true },
            close         : { type: Sequelize.FLOAT, allowNull: true },
            last          : { type: Sequelize.FLOAT, allowNull: true },
            previousClose : { type: Sequelize.FLOAT, allowNull: true },
            change        : { type: Sequelize.FLOAT, allowNull: true },
            percentage    : { type: Sequelize.FLOAT, allowNull: true },
            average       : { type: Sequelize.FLOAT, allowNull: true },
            baseVolume    : { type: Sequelize.FLOAT, allowNull: true },
            quoteVolume   : { type: Sequelize.FLOAT, allowNull: true },
            createdAt     : { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });


        await queryInterface.createTable('CandleSticks', {
            id        : { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true  },
            marketId  : { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Markets', key: 'id' } },
            charts    : { type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.FLOAT)), allowNull: true },
            createdAt : { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
    },

    down : async (queryInterface) => {
        await queryInterface.dropTable('Trades');
        await queryInterface.dropTable('Tickers');
        await queryInterface.dropTable('CandleSticks');
    }
};
