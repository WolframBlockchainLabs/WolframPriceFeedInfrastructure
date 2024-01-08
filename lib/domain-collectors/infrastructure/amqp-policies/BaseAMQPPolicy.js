class BaseAMQPPolicy {
    constructor({ amqpClient, rabbitGroupName }) {
        this.amqpClient = amqpClient;
        this.rabbitGroupName = rabbitGroupName;

        this.rabbitQueueId = null;
        this.handler = null;
    }

    async start(handler) {
        this.handler = handler;

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

    async consumer(message) {
        return this.handler(JSON.parse(message.content.toString()));
    }

    getPrivateQueueAddress() {
        return this.rabbitQueueId;
    }
}

export default BaseAMQPPolicy;
