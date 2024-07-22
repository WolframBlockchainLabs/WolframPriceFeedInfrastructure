import AppCLIProvider from '../../../AppCLIProvider.js';
import CCXTRealtimeCollectorsRunner from './CCXTRealtimeCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(CCXTRealtimeCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error('App initialization failed', err);

    process.exit(1);
});
