import { Exchange } from 'ccxt';
import AggregationTask from './AggregationTask.js';
import BaseEntity from './BaseEntity.js';
import { DataTypes as DT } from 'sequelize';
import DiscreteAggregationExchange from './DiscreteAggregationExchange.js';

class DiscreteAggregationResult extends BaseEntity {
    static schema = {
        id: { type: DT.BIGINT, primaryKey: true, autoIncrement: true },
        symbol: { type: DT.STRING, allowNull: false },
        rangeDateStart: { type: DT.DATE, allowNull: false },
        rangeDateEnd: { type: DT.DATE, allowNull: false },
        timeframeMinutes: { type: DT.SMALLINT, allowNull: false },
        results: { type: DT.JSON, allowNull: false },
        taskId: { type: DT.BIGINT, allowNull: false },
        createdAt: { type: DT.DATE, allowNull: false },
        updatedAt: { type: DT.DATE, allowNull: false },
    };

    static options = {
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
        exchangeName,
    }) {
        const where = {};

        if (rangeDateStart) {
            where.rangeDateStart = { [DT.Op.gte]: rangeDateStart };
        }

        if (rangeDateEnd) {
            where.rangeDateEnd = { [DT.Op.lte]: rangeDateEnd };
        }

        if (symbols) {
            where.symbol = { [DT.Op.in]: symbols };
        }

        if (timeframeMinutes) {
            where.timeframeMinutes = { [DT.Op.in]: timeframeMinutes };
        }

        const include = [
            {
                model: Exchange,
                ...(exchangeName && {
                    where: { name: exchangeName },
                    required: true,
                }),
            },
        ];

        return this.findAll({
            where,
            include,
        });
    }
}

export default DiscreteAggregationResult;
