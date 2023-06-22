import InitialImport from './InitialImport.js';
import AppCliProvider from '../../AppCliProvider.js';

const provider = AppCliProvider.create();

provider
    .initApp(async () => {
        const worker = new InitialImport(provider.logger);

        try {
            await worker.process({});
        } catch (error) {
            provider.logger.error(error);
        }

        await provider.shutdown();
    })
    .start();
