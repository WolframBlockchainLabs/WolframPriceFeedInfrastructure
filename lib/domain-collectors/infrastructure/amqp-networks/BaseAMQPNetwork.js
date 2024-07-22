import crypto from 'crypto';
import { promisify } from 'util';

class BaseAMQPNetwork {
    static PREFETCH_COUNT = 0;

    static QUEUE_ID_BYTES = 32;

    static EXCHANGE_TYPE = 'fanout';

    constructor({ amqpClientFactory, rabbitGroupName, retryConfig, logger }) {
        this.amqpClientFactory = amqpClientFactory;
        this.rabbitGroupName = rabbitGroupName;
        this.logger = logger;

        this.retryLimit = retryConfig.retryLimit;
        this.retryPeriodMs = retryConfig.retryPeriodMs;

        this.amqpClient = this.amqpClientFactory.create();
        this.consumerTag = null;
        this.rabbitQueueId = null;
        this.prefetchCount = this.constructor.PREFETCH_COUNT;
    }

    async start() {
        await this.amqpClient.initConnection();

        this.configureChannelPromise = new Promise(
            (resolve) => (this.resolveConfigureChannelPromise = resolve),
        );

        await this.amqpClient
            .getChannel()
            .addSetup(this.configureRabbitMQChannel.bind(this));

        return this.configureChannelPromise;
    }

    async stop() {
        await this.amqpClient
            .getChannel()
            .addSetup(this.handleChannelTeardown.bind(this));

        await this.amqpClient.closeConnection();
    }

    async configureRabbitMQChannel(channel) {
        await this.setPrefetchCount(channel);
        await this.assertExchange(channel);
        await this.assertQueue(channel);
        await this.bindQueue(channel);
        await this.assertAndBindRetryQueue(channel);
        await this.setupConsumer(channel);

        this.resolveConfigureChannelPromise();
    }

    async handleChannelTeardown(channel) {
        if (this.consumerTag) {
            await channel.cancel(this.consumerTag);
        }
    }

    async setPrefetchCount(channel) {
        await channel.prefetch(this.prefetchCount);
    }

    async assertExchange(channel) {
        await channel.assertExchange(
            this.rabbitGroupName,
            this.constructor.EXCHANGE_TYPE,
            {
                durable: false,
            },
        );
    }

    async assertQueue(channel) {
        const queueName = await this.generatePrivateQueueName();
        const queueAssertion = await channel.assertQueue(queueName, {
            exclusive: true,
            durable: false,
            autoDelete: true,
        });

        this.rabbitQueueId = queueAssertion.queue;
    }

    async bindQueue() {
        throw new Error(
            `bindQueue method is not implemented for: ${this.constructor.name}`,
        );
    }

    async assertAndBindRetryQueue(channel) {
        await channel.assertQueue(this.getRetryQueueAddress(), {
            exclusive: true,
            durable: false,
            autoDelete: true,
            deadLetterExchange: '',
            deadLetterRoutingKey: this.rabbitQueueId,
            messageTtl: this.retryPeriodMs,
        });
    }

    async setupConsumer(channel) {
        const consumerResponse = await channel.consume(
            this.rabbitQueueId,
            this.consumer.bind(this),
        );

        this.consumerTag = consumerResponse.consumerTag;
    }

    async consumer(message) {
        if (!message) return;

        try {
            const data = this.getMessageObject(message);

            await this.process(data);

            this.amqpClient.getChannel().ack(message);
        } catch {
            await this.handleRetry(message);
        }
    }

    async process() {
        throw new Error(
            `process method is not implemented for: ${this.constructor.name}`,
        );
    }

    async handleRetry(message, error) {
        const headers = message.properties.headers || {};
        const retryCount = headers.retryCount || 1;

        if (retryCount <= this.retryLimit) {
            this.logger.warning({
                message: `[${this.constructor.name}]: Error during message processing. Retrying...`,
                retryCount,
                error,
            });

            this.amqpClient
                .getChannel()
                .publish('', this.getRetryQueueAddress(), message.content, {
                    headers: { ...headers, retryCount: retryCount + 1 },
                });
        } else {
            this.logger.error({
                message: `[${this.constructor.name}]: Retry limit reached. Discarding message.`,
            });
        }

        this.amqpClient.getChannel().ack(message);
    }

    async generatePrivateQueueName() {
        const id = await this.generatePrivateQueueId();

        return `${this.rabbitGroupName}::${id}`;
    }

    async generatePrivateQueueId() {
        const randomBytes = await promisify(crypto.randomBytes)(
            this.constructor.QUEUE_ID_BYTES,
        );

        return randomBytes.toString('base64url');
    }

    getMessageObject(message) {
        if (!message) return {};

        return JSON.parse(message.content.toString());
    }

    getPrivateQueueAddress() {
        return this.rabbitQueueId;
    }

    getRetryQueueAddress() {
        return `${this.rabbitQueueId}-retry`;
    }
}

export default BaseAMQPNetwork;
