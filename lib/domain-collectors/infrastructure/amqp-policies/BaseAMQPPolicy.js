class BaseAMQPPolicy {
    constructor({ amqpClientFactory, rabbitGroupName, amqpManagementTarget }) {
        this.rabbitGroupName = rabbitGroupName;
        this.amqpManagementTarget = amqpManagementTarget;

        this.amqpClient = amqpClientFactory.create();
        this.rabbitQueueId = null;
        this.prefetchCount = 0;
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

    async configureRabbitMQChannel(channel) {
        await this.setPrefetchCount(channel);
        await this.assertBroadcastExchange(channel);
        await this.assertAndBindQueue(channel);
        await this.setupConsumer(channel);

        this.resolveConfigureChannelPromise();
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
        });

        this.rabbitQueueId = queueAssertion.queue;

        await channel.bindQueue(this.rabbitQueueId, this.rabbitGroupName, '');
    }

    async setupConsumer(channel) {
        await channel.consume(this.rabbitQueueId, this.consumer.bind(this), {
            noAck: true,
        });
    }

    async broadcast(message) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        return this.amqpClient
            .getChannel()
            .publish(this.rabbitGroupName, '', messageBuffer);
    }

    async consumer() {
        throw new Error(
            `consumer method is not implemented for: ${this.constructor.name}`,
        );
    }

    getMessageObject(message) {
        return JSON.parse(message.content.toString());
    }

    getPrivateQueueAddress() {
        return this.rabbitQueueId;
    }
}

export default BaseAMQPPolicy;
