import ethDrivers from '../../../domain-collectors/integrations/eth/index.js';
import UDEXCollectorsRunner from '../UDEXCollectorsRunner.js';

class EthCollectorsRunner extends UDEXCollectorsRunner {
    getExchangeApi({ exchange, apiKey }) {
        return new ethDrivers[exchange](apiKey);
    }
}

export default EthCollectorsRunner;
