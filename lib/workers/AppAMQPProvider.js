import AppProvider from '../AppProvider.js';

class AppAMQPProvider extends AppProvider {
    constructor(consumerConfigs) {
        super();

        this.consumerConfigs = consumerConfigs;
        this.consumers = {};
    }

    async start() {
        await this.amqpClient.initConnection();

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
            });

            await this.consumers[key].init(consumerConfig, channel);
        }
    }
}

export default AppAMQPProvider;
