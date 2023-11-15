import SearchMarketRecordByIdScope from '../../scopes/SearchMarketRecordByIdScope.js';
import SearchMarketRecordsScope from '../../scopes/SearchMarketRecordsScope.js';
import BaseEntity from '../BaseEntity.js';

class BaseMarketRecordEntity extends BaseEntity {
    static options = {
        updatedAt: false,
        scopes: {
            search(queryParams) {
                const scope = new SearchMarketRecordsScope(
                    BaseEntity.sequelize,
                );

                return scope.process(queryParams);
            },
            searchById(recordId) {
                const scope = new SearchMarketRecordByIdScope(
                    BaseEntity.sequelize,
                );

                return scope.process(recordId);
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
