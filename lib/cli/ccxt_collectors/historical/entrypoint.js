import AppCLIProvider from '../../AppCLIProvider.js';
import CCXTHistoricalCollectorsRunner from './CCXTHistoricalCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(CCXTHistoricalCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
