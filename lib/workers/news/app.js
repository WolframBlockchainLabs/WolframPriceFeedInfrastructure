import config from '../../config.cjs';
import UpdateStatus    from './UpdateStatus.js';
import AppCliProvider  from './../../AppCliProvider.js';


const { intervals : { newsWorkerInterval } } = config;

const provider = AppCliProvider.create();

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

provider.initApp(async () => {
    const worker = new UpdateStatus();

    while (true) { // eslint-disable-line no-constant-condition
        try {
            await worker.process({});
            await sleep(newsWorkerInterval);
        } catch (e) {
            console.log(e.stack);
        }
    }
}).start();

