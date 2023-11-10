import { WS_PRICING_QUEUE } from '../../../constants/rabbimqQueues.js';
import BaseEmitter from './BaseEmitter.js';

class PricingEmitter extends BaseEmitter {
    WS_PRICING_QUEUE = WS_PRICING_QUEUE;

    constructor({ amqpClient, ...options }) {
        super(options);

        this.amqpClient = amqpClient;
    }

    run() {
        super.run();

        this.initAMQPConnection();
    }

    initAMQPConnection() {
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

    process(message) {
        const data = JSON.parse(message.content.toString());

        this.io.emit(`${data.exchange}-${data.symbol}-${data.type}`, data);

        this.amqpClient.getChannel().ack(message);

        this.logger.debug(
            `Event for [${data.exchange}-${data.symbol}-${data.type}] has been emitted successfully`,
        );
    }
}

export default PricingEmitter;
