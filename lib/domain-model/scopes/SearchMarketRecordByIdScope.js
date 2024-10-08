import BaseScope from './BaseScope.js';

class SearchMarketRecordByIdScope extends BaseScope {
    process(recordId) {
        return {
            include: [
                {
                    model: this.sequelize.models.Market,
                    attributes: ['id', 'symbol'],
                    include: [
                        {
                            model: this.sequelize.models.Exchange,
                            attributes: ['id', 'name'],
                        },
                    ],
                },
            ],
            where: {
                id: recordId,
            },
        };
    }
}

export default SearchMarketRecordByIdScope;
