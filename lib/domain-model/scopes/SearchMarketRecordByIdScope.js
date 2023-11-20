import BaseScope from './BaseScope.js';

class SearchMarketRecordByIdScope extends BaseScope {
    process(recordId) {
        return {
            include: [
                {
                    model: this.sequelize.models.Market,
                    as: 'Market',
                    attributes: ['id', 'symbol'],
                    include: [
                        {
                            model: this.sequelize.models.Exchange,
                            as: 'Exchange',
                            attributes: ['name'],
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
