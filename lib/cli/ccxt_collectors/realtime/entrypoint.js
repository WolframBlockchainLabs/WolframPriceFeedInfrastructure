import AppCLIProvider from '../../AppCLIProvider.js';
import CCXTCollectorsRunner from './CCXTCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(CCXTCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
