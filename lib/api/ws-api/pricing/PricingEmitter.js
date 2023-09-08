import { WS_PRICING_QUEUE } from '../../../constants/rabbimqQueues.js';

class PricingEmitter {
    constructor({ io, amqpClient, logger }) {
        this.logger = logger;
        this.amqpClient = amqpClient;
        this.io = io;

        this.WS_PRICING_QUEUE = WS_PRICING_QUEUE;
    }

    async initAMQPConnection() {
        this.amqpClient.getChannel().addSetup(async (channel) => {
            await channel.assertQueue(this.WS_PRICING_QUEUE, {
                durable: true,
            });

            await channel.consume(
                this.WS_PRICING_QUEUE,
                this.process.bind(this),
            );
        });
    }

    async process(message) {
        const data = JSON.parse(message.content.toString());

        this.io.emit(`${data.exchange}-${data.symbol}-${data.type}`, data);

        this.amqpClient.getChannel().ack(message);

        this.logger.info(
            `Event for [${data.exchange}-${data.symbol}-${data.type}] has been emitted successfully`,
        );
    }
}

export default PricingEmitter;
