import { WS_PRICING_QUEUE } from '#constants/rabbimqQueues.js';
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
        const { exchange, symbol, type, collectorTraceId } = data;

        this.io.emit(`${exchange}-${symbol}-${type}`, data);

        this.amqpClient.getChannel().ack(message);

        this.logger.debug({
            message: `Event for [${exchange}-${symbol}-${type}] has been emitted successfully`,
            context: {
                collectorTraceId,
                intervalStart: new Date(
                    data.payload.intervalStart,
                ).toISOString(),
                intervalEnd: new Date(data.payload.intervalEnd).toISOString(),
            },
        });
    }
}

export default PricingEmitter;
