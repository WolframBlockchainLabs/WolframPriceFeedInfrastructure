import amqp from 'amqp-connection-manager';

class AMQPClient {
    constructor(rabbitMqConfig) {
        this.rabbitMqConfig = rabbitMqConfig;

        this.connection = null;
        this.channel = null;
    }

    async initConnection() {
        this.connection = await amqp.connect(this.rabbitMqConfig.urls);

        this.channel = await this.connection.createChannel();
    }

    async closeConnection() {
        await this.channel.close();
        await this.connection.close();
    }

    publish(queue, message) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        return this.channel.sendToQueue(queue, messageBuffer);
    }

    getChannel() {
        if (!this.channel) throw new Error('AMQP channel is not initiated');

        return this.channel;
    }
}

export default AMQPClient;
