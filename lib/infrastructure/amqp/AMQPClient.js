import ChannelClosedException from '#domain-model/exceptions/rabbitmq/ChannelClosedException.js';
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

    async publish({ exchange, routingKey = '', message, options }) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        try {
            return await this.channel.publish(
                exchange,
                routingKey,
                messageBuffer,
                options,
            );
        } catch (error) {
            if (error.message === 'channel closed') {
                throw new ChannelClosedException();
            }

            throw error;
        }
    }

    async sendToQueue(queue, message) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        try {
            return await this.channel.sendToQueue(queue, messageBuffer);
        } catch (error) {
            if (error.message === 'channel closed') {
                throw new ChannelClosedException();
            }

            throw error;
        }
    }

    async broadcast(exchange, message) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        try {
            return await this.channel.publish(exchange, '', messageBuffer);
        } catch (error) {
            if (error.message === 'channel closed') {
                throw new ChannelClosedException();
            }

            throw error;
        }
    }

    getChannel() {
        if (!this.channel) throw new Error('AMQP channel is not initiated');

        return this.channel;
    }
}

export default AMQPClient;
