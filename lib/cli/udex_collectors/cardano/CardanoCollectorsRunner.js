import cardanoDrivers from '../../../collectors/integrations/cardano/index.js';
import UDEXCollectorsRunner from '../UDEXCollectorsRunner.js';

class CardanoCollectorsRunner extends UDEXCollectorsRunner {
    getExchangeApi({ exchange, apiKey }) {
        return new cardanoDrivers[exchange]({
            projectId: apiKey,
        });
    }
}

export default CardanoCollectorsRunner;
