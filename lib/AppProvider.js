import BaseProvider from './BaseProvider.js';
import RestApp from './api/rest-api/RestApp.js';
import WSApp from './api/ws-api/WSApp.js';

class AppProvider extends BaseProvider {
    async start(port) {
        await super.start();

        await this.restApp.start(port || this.config.app.port);
        await this.wsApp.start(this.restApp.getHTTPServer());
    }

    async shutdown() {
        await this.restApp.stop();
        await this.wsApp.stop();

        await super.shutdown();
    }

    build() {
        super.build();

        this.restApp = this.initRestApp({
            sequelize: this.sequelize,
            logger: this.logger,
            config: this.config,
            clsNamespace: this.clsNamespace,
        });

        this.wsApp = this.initWSApp({
            logger: this.logger,
            config: this.config,
            amqpClient: this.amqpClient,
        });
    }

    initRestApp({ sequelize, logger, config, clsNamespace }) {
        const restApp = new RestApp({
            sequelize,
            logger,
            config,
            clsNamespace,
        });

        return restApp.init();
    }

    initWSApp({ logger, config, amqpClient }) {
        return new WSApp({ logger, config, amqpClient });
    }
}

export default AppProvider;
