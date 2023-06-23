import Exchange from '../../domain-model/entities/Exchange.js';
import Base from '../BaseUseCase.js';

class ExchangesList extends Base {
    static validationRules = {
        limit: ['not_empty', 'positive_integer', { default: 20 }],
        offset: ['not_empty', 'integer', { min_number: 0 }, { default: 0 }],
    };

    async execute() {
        const exchangesList = await Exchange.findAll();

        return exchangesList;
    }
}

export default ExchangesList;
