import cardanoDrivers from '../../../domain-collectors/integrations/cardano/index.js';
import UDEXCollectorsRunner from '../UDEXCollectorsRunner.js';

class CardanoCollectorsRunner extends UDEXCollectorsRunner {
    RABBIT_GROUP_NAME = 'cardano';

    getExchangeApi({ exchange, apiKey }) {
        return new cardanoDrivers[exchange]({
            projectId: apiKey,
        });
    }
}

export default CardanoCollectorsRunner;
