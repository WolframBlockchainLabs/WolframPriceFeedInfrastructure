import AppCLIProvider from '../../AppCLIProvider.js';
import EthCollectorsRunner from './EthCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(EthCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
