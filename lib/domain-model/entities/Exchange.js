import Base from './Base.js';
import { DataTypes as DT } from 'sequelize';
import Market from './Market.js';

export default class Exchange extends Base {
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
