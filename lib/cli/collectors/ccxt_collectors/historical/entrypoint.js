import AppFiniteCLIProvider from '../../../AppFiniteCLIProvider.js';
import CCXTHistoricalCollectorsRunner from './CCXTHistoricalCollectorsRunner.js';

async function main() {
    const provider = new AppFiniteCLIProvider(CCXTHistoricalCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error('App initialization failed', err);

    process.exit(1);
});
