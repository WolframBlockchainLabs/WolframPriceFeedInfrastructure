function wrapAMQPNetwork(AMQPNetworkClass) {
    return class BaseAMQPPolicy extends AMQPNetworkClass {
        static AMQP_NETWORK_PREFIX = 'amqp-network';

        static getPolicyGroup(rabbitGroupName) {
            return `${this.AMQP_NETWORK_PREFIX}::${rabbitGroupName}::${this.name}`;
        }

        constructor({
            amqpClientFactory,
            policiesConfigs,
            rabbitGroupName,
            marketsManager,
            marketEventManager,
            logger,
        }) {
            super({
                amqpClientFactory,
                rabbitGroupName,
                retryConfig: policiesConfigs.retryConfig,
                logger,
            });

            this.initialGroupName = rabbitGroupName;
            this.policiesConfigs = policiesConfigs;
            this.rabbitGroupName =
                this.constructor.getPolicyGroup(rabbitGroupName);
            this.marketsManager = marketsManager;
            this.marketEventManager = marketEventManager;
        }

        async generatePrivateQueueName() {
            const id = await this.generatePrivateQueueId();
            const identity = this.marketsManager.getIdentity();
            const prefix = this.constructor.AMQP_NETWORK_PREFIX;

            return `${prefix}::${this.initialGroupName}::${identity}::${this.constructor.name}::${id}`;
        }
    };
}

export default wrapAMQPNetwork;
