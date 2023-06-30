import { Server } from 'socket.io';
import PricingEmitter from './pricing/PricingEmitter.js';

class WSApp {
    constructor({ logger, config, amqpClient }) {
        this.logger = logger;
        this.config = config;
        this.amqpClient = amqpClient;

        this.io = null;
        this.emitters = {};
    }

    async start(httpServer) {
        this.io = new Server(httpServer);
        this.emitters.pricing = new PricingEmitter({
            io: this.io,
            amqpClient: this.amqpClient,
            logger: this.logger,
        });

        await this.emitters.pricing.initAMQPConnection();
    }
}

export default WSApp;
