import AppCLIProvider from '../../AppCLIProvider.js';
import TezosCollectorsRunner from './TezosCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(TezosCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
