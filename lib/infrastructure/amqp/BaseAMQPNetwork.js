class BaseAMQPNetwork {
    static PREFETCH_COUNT = 0;

    constructor({ amqpClientFactory, rabbitGroupName, retryConfig }) {
        this.amqpClientFactory = amqpClientFactory;
        this.rabbitGroupName = rabbitGroupName;

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
        await this.assertBroadcastExchange(channel);
        await this.assertAndBindQueue(channel);
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

    async assertBroadcastExchange(channel) {
        await channel.assertExchange(this.rabbitGroupName, 'fanout', {
            durable: false,
        });
    }

    async assertAndBindQueue(channel) {
        const queueAssertion = await channel.assertQueue('', {
            exclusive: true,
            durable: false,
            autoDelete: true,
        });

        this.rabbitQueueId = queueAssertion.queue;

        await channel.bindQueue(this.rabbitQueueId, this.rabbitGroupName, '');
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

    async broadcast(message) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        return this.amqpClient
            .getChannel()
            .publish(this.rabbitGroupName, '', messageBuffer);
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

    async handleRetry(message) {
        const headers = message.properties.headers || {};
        const retryCount = headers.retryCount || 1;

        if (retryCount <= this.retryLimit) {
            this.amqpClient
                .getChannel()
                .publish('', this.getRetryQueueAddress(), message.content, {
                    headers: { ...headers, retryCount: retryCount + 1 },
                });
        }

        this.amqpClient.getChannel().ack(message);
    }

    getMessageObject(message) {
        if (!message) return {};

        return JSON.parse(message.content.toString());
    }

    getPrivateQueueAddress() {
        return this.rabbitQueueId;
    }

    getRetryQueueAddress() {
        return `retry-${this.rabbitQueueId}`;
    }
}

export default BaseAMQPNetwork;
