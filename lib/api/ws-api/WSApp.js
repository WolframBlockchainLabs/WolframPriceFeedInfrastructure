import { Server } from 'socket.io';

class WSApp {
    constructor({ logger, config, amqpClient }) {
        this.logger = logger;
        this.config = config;
        this.amqpClient = amqpClient;

        this.io = null;
    }

    async start(httpServer) {
        this.io = new Server(httpServer);
    }
}

export default WSApp;
