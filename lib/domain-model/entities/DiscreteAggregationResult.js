import AggregationTask from './AggregationTask.js';
import BaseEntity from './BaseEntity.js';
import { DataTypes as DT, Op } from 'sequelize';
import DiscreteAggregationExchange from './DiscreteAggregationExchange.js';
import Exchange from './Exchange.js';

class DiscreteAggregationResult extends BaseEntity {
    static schema = {
        id: { type: DT.BIGINT, primaryKey: true, autoIncrement: true },
        symbol: { type: DT.STRING, allowNull: false },
        processedCount: { type: DT.INTEGER, allowNull: false },
        count: { type: DT.INTEGER, allowNull: false },
        rangeDateStart: { type: DT.DATE, allowNull: false },
        rangeDateEnd: { type: DT.DATE, allowNull: false },
        timeframeMinutes: { type: DT.SMALLINT, allowNull: false },
        candles: { type: DT.JSON, allowNull: false },
        taskId: { type: DT.BIGINT, allowNull: false },
        createdAt: { type: DT.DATE, allowNull: false },
    };

    static options = {
        updatedAt: false,
        indexes: [
            {
                name: 'DiscreteAggregationResults_range_search_idx',
                fields: ['rangeDateStart', 'rangeDateEnd', 'symbol'],
            },
            {
                name: 'DiscreteAggregationResults_symbol_key',
                fields: ['symbol'],
            },
        ],
    };

    static initRelations() {
        this.belongsTo(AggregationTask, {
            foreignKey: 'taskId',
            targetKey: 'id',
        });

        this.belongsToMany(Exchange, {
            through: DiscreteAggregationExchange,
            foreignKey: 'discreteAggregationResultId',
            otherKey: 'exchangeId',
        });
    }

    static async findAggregations({
        rangeDateStart,
        rangeDateEnd,
        symbols,
        timeframeMinutes,
        exchangeNames,
        limit,
        offset,
    }) {
        const where = {};

        if (rangeDateStart) {
            where.rangeDateStart = { [Op.gte]: rangeDateStart };
        }

        if (rangeDateEnd) {
            where.rangeDateEnd = { [Op.lte]: rangeDateEnd };
        }

        if (symbols) {
            where.symbol = { [Op.in]: symbols };
        }

        if (timeframeMinutes) {
            where.timeframeMinutes = { [Op.in]: timeframeMinutes };
        }

        const include = [
            {
                model: Exchange,
                ...(exchangeNames && {
                    where: { name: { [Op.in]: exchangeNames } },
                    required: true,
                }),
            },
        ];

        return this.findAll({
            where,
            include,
            limit,
            offset,
        });
    }
}

export default DiscreteAggregationResult;
