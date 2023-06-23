import BaseWorker from '../BaseWorker.js';
import Exchange from '../../domain-model/entities/Exchange.js';
import EXCHANGES from '../../constants/exchanges.js';

class InitialImport extends BaseWorker {
    async execute() {
        for (const exchange of EXCHANGES) {
            await Exchange.create({
                externalExchangeId: exchange.externalExchangeId,
                name: exchange.name,
            });
        }
    }
}

export default InitialImport;
