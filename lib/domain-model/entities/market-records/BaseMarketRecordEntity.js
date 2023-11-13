import BaseEntity from '../BaseEntity.js';

class BaseMarketRecordEntity extends BaseEntity {
    static options = {
        updatedAt: false,
        scopes: {
            search(queryParams) {
                return BaseMarketRecordEntity.predefinedScopes.searchMarketRecords(
                    queryParams,
                );
            },
        },
    };

    static initRelations() {
        this.belongsTo(this.sequelize.models.Market, {
            foreignKey: 'marketId',
            targetKey: 'id',
            as: 'Market',
        });
    }
}

export default BaseMarketRecordEntity;
