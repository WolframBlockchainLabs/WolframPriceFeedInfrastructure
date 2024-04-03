import { Exchange } from 'ccxt';
import BaseEntity from './BaseEntity.js';
import { DataTypes as DT } from 'sequelize';
import DiscreteAggregationResult from './DiscreteAggregationResult.js';

class DiscreteAggregationExchange extends BaseEntity {
    static schema = {
        id: { type: DT.BIGINT, primaryKey: true, autoIncrement: true },
        discreteAggregationResultId: {
            type: DT.BIGINT,
            allowNull: false,
            references: {
                model: 'DiscreteAggregationResults',
                key: 'id',
            },
        },
        exchangeId: {
            type: DT.INTEGER,
            allowNull: false,
            references: {
                model: 'Exchanges',
                key: 'id',
            },
        },
        createdAt: { type: DT.DATE, allowNull: false },
        updatedAt: { type: DT.DATE, allowNull: false },
    };

    static initRelations() {
        this.belongsTo(DiscreteAggregationResult, {
            foreignKey: 'discreteAggregationResultId',
            targetKey: 'id',
        });
        this.belongsTo(Exchange, {
            foreignKey: 'exchangeId',
            targetKey: 'id',
        });
    }
}

export default DiscreteAggregationExchange;
