import path           from 'path';
import { rm }         from 'fs/promises';
import nodemailerMock from 'nodemailer-mock';
import stubTransport  from 'nodemailer-stub-transport';
import AppProvider    from './AppProvider.js';

export default class AppTestProvider extends AppProvider {
    initNotificator() {
        const notificator = super.initNotificator();
        const transport   = nodemailerMock.createTransport(stubTransport());

        notificator.setTransport(transport);
    }

    start() {
        return super.start({ appPort: this.config.appTestPort });
    }

    subscribeToSystemSignals() {
        return this;
    }

    async shutdown() {
        await rm(path.resolve('storage/sessions'), { recursive: true, force: true });

        super.shutdown();
    }
}
