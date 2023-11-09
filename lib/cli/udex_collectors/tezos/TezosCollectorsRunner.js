import tezosDrivers from '../../../domain-collectors/integrations/tezos/index.js';
import UDEXCollectorsRunner from '../UDEXCollectorsRunner.js';

class TezosCollectorsRunner extends UDEXCollectorsRunner {
    RABBIT_GROUP_NAME = 'tezos';

    getExchangeApi({ exchange, apiKey }) {
        return new tezosDrivers[exchange](apiKey);
    }
}

export default TezosCollectorsRunner;
