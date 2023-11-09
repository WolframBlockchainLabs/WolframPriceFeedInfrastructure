class BackoffManager {
    constructor({ amqpClient, rabbitGroupName }) {
        this.amqpClient = amqpClient;
        this.rabbitGroupName = rabbitGroupName;

        this.rabbitQueueId = null;
        this.reloadHandler = null;
    }

    async start(reloadHandler) {
        this.reloadHandler = reloadHandler;

        await this.setupReplicaChannel();
    }

    async setupReplicaChannel() {
        await this.amqpClient
            .getChannel()
            .addSetup(this.configureRabbitMQChannel.bind(this));
    }

    async configureRabbitMQChannel(channel) {
        await this.assertBroadcastExchange(channel);
        await this.assertAndBindQueue(channel);
        await this.setupConsumer(channel);
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
        await channel.consume(this.rabbitQueueId, this.reloadHandler, {
            noAck: true,
        });
    }

    async broadcastRateLimitChange(rateLimitMultiplier) {
        const messageBuffer = Buffer.from(
            JSON.stringify({ rateLimitMultiplier }),
        );

        return this.amqpClient
            .getChannel()
            .publish(this.rabbitGroupName, '', messageBuffer);
    }
}

export default BackoffManager;
