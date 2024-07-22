import { MARKET_EVENTS_DICT } from '#constants/collectors/market-events.js';
import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/ReplicaDiscoveryPolicy.js';
import BaseMarketEventHandler from './BaseMarketEventHandler.js';

class ReloadClusterEventHandler extends BaseMarketEventHandler {
    static EVENT_NAME = MARKET_EVENTS_DICT.RELOAD_CLUSTER;

    async execute() {
        const replicaDiscoveryPolicy = this.getPolicy(ReplicaDiscoveryPolicy);

        return replicaDiscoveryPolicy.broadcastHello();
    }
}

export default ReloadClusterEventHandler;
