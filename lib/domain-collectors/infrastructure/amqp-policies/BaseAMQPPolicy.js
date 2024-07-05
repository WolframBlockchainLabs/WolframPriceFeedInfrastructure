import BaseAMQPNetwork from '#infrastructure/amqp/BaseAMQPNetwork.js';

class BaseAMQPPolicy extends BaseAMQPNetwork {
    static getPolicyGroup(rabbitGroupName) {
        return `${rabbitGroupName}::${this.name}`;
    }

    constructor({
        amqpClientFactory,
        policiesConfigs,
        rabbitGroupName,
        marketsManager,
        marketEventManager,
    }) {
        super({
            amqpClientFactory,
            rabbitGroupName,
            retryConfig: policiesConfigs.retryConfig,
        });

        this.policiesConfigs = policiesConfigs;
        this.rabbitGroupName = this.constructor.getPolicyGroup(rabbitGroupName);
        this.marketsManager = marketsManager;
        this.marketEventManager = marketEventManager;
    }
}

export default BaseAMQPPolicy;
