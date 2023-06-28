import { Server } from 'socket.io';

class WSApp {
    constructor({ logger, config }) {
        this.logger = logger;
        this.config = config;

        this.io = null;
    }

    async start(httpServer) {
        this.io = new Server(httpServer);
    }
}

export default WSApp;
