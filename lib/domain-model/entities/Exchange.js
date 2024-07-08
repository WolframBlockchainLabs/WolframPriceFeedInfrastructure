import BaseEntity from './BaseEntity.js';
import { DataTypes as DT } from 'sequelize';
import Market from './Market.js';

class Exchange extends BaseEntity {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        externalExchangeId: { type: DT.STRING, allowNull: false, unique: true },
        name: { type: DT.STRING, allowNull: false },
        dataSource: { type: DT.STRING, allowNull: false },
    };

    static options = {
        createdAt: false,
        updatedAt: false,
        indexes: [
            {
                name: 'Exchanges_externalExchangeId_key',
                unique: true,
                fields: ['externalExchangeId'],
            },
            {
                name: 'Exchanges_name_idx',
                fields: ['name'],
            },
        ],
    };

    static initRelations() {
        this.hasMany(Market, {
            foreignKey: 'exchangeId',
            sourceKey: 'id',
            as: 'Market',
        });
    }
}

export default Exchange;
