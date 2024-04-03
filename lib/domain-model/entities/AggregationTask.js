import BaseEntity from './BaseEntity.js';
import { DataTypes as DT } from 'sequelize';

class AggregationTask extends BaseEntity {
    static STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        ERROR: 'ERROR',
    };

    static STATUSES_LIST = Object.values(AggregationTask.STATUS);

    static TYPE = {
        CANDLES_DISCRETE_AGGREGATION: 'CANDLES_DISCRETE_AGGREGATION',
        CANDLES_COMPLETE_AGGREGATION: 'CANDLES_COMPLETE_AGGREGATION',
    };

    static TYPES_LIST = Object.values(AggregationTask.TYPE);

    static schema = {
        id: { type: DT.BIGINT, primaryKey: true, autoIncrement: true },
        type: { type: DT.ENUM(this.TYPES_LIST), allowNull: false },
        status: {
            type: DT.ENUM(this.STATUSES_LIST),
            allowNull: false,
            defaultValue: this.STATUS.PENDING,
        },
        createdAt: { type: DT.DATE, allowNull: false },
        updatedAt: { type: DT.DATE, allowNull: false },
    };
}

export default AggregationTask;
