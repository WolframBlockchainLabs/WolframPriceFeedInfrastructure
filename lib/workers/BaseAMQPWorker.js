import BaseWorker from './BaseWorker.js';

class BaseAMQPWorker extends BaseWorker {
    channel = null;

    consumerConfig = null;

    async init(consumerConfig, channel) {
        this.consumerConfig = consumerConfig;
        this.channel = channel;

        await this.channel.assertQueue(this.consumerConfig.queue, {
            durable: true,
        });
        await this.channel.consume(
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

        this.channel.ack(message);
    }
}

export default BaseAMQPWorker;
