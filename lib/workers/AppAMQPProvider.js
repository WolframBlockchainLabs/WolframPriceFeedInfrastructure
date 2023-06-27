import amqp from 'amqp-connection-manager';
import AppProvider from '../AppProvider.js';

class AppAMQPProvider extends AppProvider {
    amqpConnection = null;

    channelWrapper = null;

    constructor(consumerConfigs) {
        super();

        this.consumerConfigs = consumerConfigs;
        this.consumers = {};
    }

    async start() {
        this.amqpConnection = amqp.connect(this.config.rabbitmq.urls);

        this.channelWrapper = await this.amqpConnection.createChannel({
            setup: this._initConsumers.bind(this),
        });

        this.logger.info('RabbitMQ microservice is initiated');
    }

    async _initConsumers(channel) {
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
