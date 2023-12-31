import BaseEntity from './BaseEntity.js';
import { DataTypes as DT } from 'sequelize';
import Market from './Market.js';

class Exchange extends BaseEntity {
    static schema = {
        id: { type: DT.INTEGER, primaryKey: true, autoIncrement: true },
        externalExchangeId: { type: DT.STRING, allowNull: false, unique: true },
        name: { type: DT.STRING, allowNull: false },
    };

    static options = {
        createdAt: false,
        updatedAt: false,
    };

    static initRelations() {
        this.hasOne(Market, {
            foreignKey: 'exchangeId',
            targetKey: 'id',
            as: 'Exchange',
        });
    }
}

export default Exchange;
