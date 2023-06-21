import path from 'path';
import { rm } from 'fs/promises';
import AppProvider from './AppProvider.js';

export default class AppTestProvider extends AppProvider {
    start() {
        return super.start({ appPort: this.config.appTestPort });
    }

    subscribeToSystemSignals() {
        return this;
    }

    async shutdown() {
        await rm(path.resolve('storage/sessions'), {
            recursive: true,
            force: true,
        });

        super.shutdown();
    }
}
