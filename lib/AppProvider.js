import * as api from './api/rest-api/app.js';
import config   from './config.cjs';


export default class AppProvider {
    config = null;

    sequelize = null;

    notificator = null;

    api = null;

    loggers = {};

    dbConfig = {};

    static create() {
        return new this();
    }

    initApp() {
        this.config = config;
        this.api = api;

        // this.initLogger();
        // this.initDb();
        // this.initUseCases();
        // this.subscribeToSystemSignals();

        return this;
    }

    // async initLogger() {
    //     this.loggers = initLogger(this.config.logs, {
    //         namespase  : clsNamespace,
    //         contextKey : 'traceID'
    //     });

    //     this.loggers.application.info(`[App] Init Mode: ${process.env.MODE}`);

    //     const ip = await getIp();

    //     WinstonMail.setSender(async (info) => {
    //         const details = JSON.stringify(info.message, null, JSON_OFFSET);

    //         const notificationEmail = this?.config?.mail?.notification;

    //         if (notificationEmail) {
    //             await this.notificator.notify(
    //                 'EMERGENCY',
    //                 notificationEmail,
    //                 {
    //                     details,
    //                     ip
    //                 }
    //             );
    //         }
    //     });
    // }

    start(params = {}) {
        this.api.init({ sequelize: this.sequelize });
        this.api.start({
            appPort : this.config.appPort,
            secure  : this.config.https,
            ...params
        });
    }

    // initDb() {
    //     DomainModel.setLogger(this.loggers.application);
    //     DomainModel.setLangConfig(this.config.langs);

    //     const dbMode = process.env.MODE === 'application' ? 'db' : 'test-db';
    //     const { sequelize } = DomainModel.initModels(this.config[dbMode], this.dbConfig);

    //     this.sequelize = sequelize;
    // }

    // initUseCases() {
    //     UseCaseBase.setSequelizeInstanse(this.sequelize);
    //     UseCaseBase.setAppConfig(this.config);
    //     // UseCaseBase.setNotificator(this.notificator);
    // }

    // subscribeToSystemSignals() {
    //     process.on('SIGTERM', async () => {
    //         this.loggers.application.info('[App] SIGTERM signal catched');

    //         await this.shutdown();
    //     });

    //     process.on('SIGINT', async () => {
    //         this.loggers.application.info('[App] SIGINT signal catched');

    //         await this.shutdown();
    //     });

    //     process.on('unhandledRejection', error => {
    //         console.error(error);

    //         if (Object.keys(this.loggers).length) {
    //             this.loggers.application.emerg({
    //                 type  : 'UnhandledRejection',
    //                 error : error.stack
    //             });
    //         }
    //     });

    //     process.on('uncaughtException', error => {
    //         console.error(error);

    //         if (Object.keys(this.loggers).length) {
    //             this.loggers.application.emerg({
    //                 type  : 'UncaughtException',
    //                 error : error.stack
    //             });
    //         }
    //     });
    // }


    async shutdown() {
        if (this.app) {
            await this.app.stop();
        }

        if (this.sequelize) {
            await this.sequelize.close();
        }

        if (this.loggers) {
            this.loggers.application.info('[App] Exit');
        }

        process.exit(0);
    }
}
