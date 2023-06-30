import BaseWorker from './BaseWorker.js';

class BaseAMQPWorker extends BaseWorker {
    constructor({ logger, sequelize, amqpClient, consumerConfig }) {
        super({ logger, sequelize });

        this.amqpClient = amqpClient;
        this.consumerConfig = consumerConfig;
    }

    async initAMQPConnection(channel) {
        await channel.assertQueue(this.consumerConfig.queue, {
            durable: true,
        });
        await channel.consume(
            this.consumerConfig.queue,
            this.process.bind(this),
        );

        this.logger.info({
            message: `${this.constructor.name} consumer is initiated`,
            consumerConfig: this.consumerConfig,
        });
    }

    async process(message) {
        const data = JSON.parse(message.content.toString());

        await super.process(data);

        this.amqpClient.getChannel().ack(message);
    }
}

export default BaseAMQPWorker;
