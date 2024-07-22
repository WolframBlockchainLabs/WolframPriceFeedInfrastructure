import BaseAMQPNetwork from './BaseAMQPNetwork.js';

class HeadersAMQPNetwork extends BaseAMQPNetwork {
    static EXCHANGE_TYPE = 'headers';

    async start(headers) {
        this.headers = headers;

        await super.start();
    }

    async bindQueue(channel) {
        await channel.bindQueue(this.rabbitQueueId, this.rabbitGroupName, '', {
            'x-match': 'any',
            ...this.headers,
        });
    }

    async send(message, headers) {
        return this.sendToExchange({
            message,
            headers,
            exchange: this.rabbitGroupName,
        });
    }

    async sendToExchange({ message, headers, exchange }) {
        const messageBuffer = Buffer.from(JSON.stringify(message));

        return this.amqpClient
            .getChannel()
            .publish(exchange, '', messageBuffer, { headers });
    }
}

export default HeadersAMQPNetwork;
