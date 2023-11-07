import BaseProvider from '../BaseProvider.js';

class AppAMQPProvider extends BaseProvider {
    constructor(consumerConfigs) {
        super();

        this.consumerConfigs = consumerConfigs;
        this.consumers = {};
    }

    async start() {
        await super.start();

        await this.amqpClient
            .getChannel()
            .addSetup(this.initConsumers.bind(this));
    }

    async initConsumers(channel) {
        for (const key in this.consumerConfigs) {
            const consumerConfig = this.consumerConfigs[key];

            this.consumers[key] = new consumerConfig.ConsumerClass({
                logger: this.logger,
                sequelize: this.sequelize,
                amqpClient: this.amqpClient,
                config: this.config.amqpWorker,
                consumerConfig,
            });

            await this.consumers[key].initAMQPConnection(channel);
        }
    }
}

export default AppAMQPProvider;
