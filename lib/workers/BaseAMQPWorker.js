import BaseWorker from './BaseWorker.js';

class BaseAMQPWorker extends BaseWorker {
    constructor({ logger, sequelize, amqpClient, consumerConfig, config }) {
        super({ logger, sequelize });

        this.retryLimit = config.retryLimit;
        this.retryPeriodMs = config.retryPeriodMs;

        this.amqpClient = amqpClient;
        this.consumerConfig = consumerConfig;

        this.primaryQueue = this.consumerConfig.queue;
        this.retryQueue = `${this.primaryQueue}-retry`;
    }

    async initAMQPConnection(channel) {
        await channel.assertQueue(this.primaryQueue, {
            durable: true,
        });

        await channel.assertQueue(this.retryQueue, {
            durable: true,
            deadLetterExchange: '',
            deadLetterRoutingKey: this.primaryQueue,
            messageTtl: this.retryPeriodMs,
        });

        await channel.consume(this.primaryQueue, this.process.bind(this));

        this.logger.info({
            message: `${this.constructor.name} consumer is initiated`,
            consumerConfig: this.consumerConfig,
        });
    }

    async process(message) {
        try {
            const data = JSON.parse(message.content.toString());

            await this.sequelize.transaction(() => {
                return this.execute(data);
            });

            this.amqpClient.getChannel().ack(message);
        } catch (error) {
            await this.handleRetry(message, error);
        }
    }

    async handleRetry(message, error) {
        const headers = message.properties.headers || {};
        const retryCount = headers.retryCount || 1;

        if (retryCount < this.retryLimit) {
            this.logger.warning({
                message: `Error processing message from: ${this.primaryQueue}. Retrying...`,
                retryCount,
                error,
            });

            this.amqpClient
                .getChannel()
                .publish('', this.retryQueue, message.content, {
                    headers: { ...headers, retryCount: retryCount + 1 },
                });
        } else {
            this.logger.error({
                message: `Retry limit reached for ${this.primaryQueue}. Discarding message.`,
            });
        }

        this.amqpClient.getChannel().ack(message);
    }
}

export default BaseAMQPWorker;
