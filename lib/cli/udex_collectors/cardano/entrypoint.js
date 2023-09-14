import AppCLIProvider from '../../AppCLIProvider.js';
import CardanoCollectorsRunner from './CardanoCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(CardanoCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
