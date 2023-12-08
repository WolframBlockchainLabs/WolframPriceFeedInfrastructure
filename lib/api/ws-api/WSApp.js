import { Server } from 'socket.io';
import emitters from './emitters/index.js';

class WSApp {
    constructor({ logger, config, amqpClient }) {
        this.logger = logger;
        this.config = config;
        this.amqpClient = amqpClient;

        this.io = null;
        this.emitters = emitters;
        this.emitterInstances = {};
    }

    async start(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: Object.values(this.config.urls),
            },
        });

        this.initEmitters();
    }

    async stop() {
        this.io.close();
    }

    initEmitters() {
        this.emitters.forEach((Emitter) => {
            this.emitterInstances[Emitter.name] = new Emitter(this);

            this.emitterInstances[Emitter.name].run();
        });
    }
}

export default WSApp;
