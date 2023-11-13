import BaseEntity from '../BaseEntity.js';
import Market from '../Market.js';

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
        this.belongsTo(Market, {
            foreignKey: 'marketId',
            targetKey: 'id',
            as: 'Market',
        });
    }
}

export default BaseMarketRecordEntity;
