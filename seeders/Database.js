import ImportDB       from './../lib/workers/database/Import.js';
import AppCliProvider from './../lib/AppCliProvider.js';

const provider = AppCliProvider.create();

provider.initApp(async () => {
    const worker = new ImportDB();

    try {
        await worker.process({});
    } catch (e) {
        console.log(e.stack);
    }

    await provider.shutdown();

    // process.exit();
}).start();

