import AppCLIProvider from '../../AppCLIProvider.js';
import UDEXCollectorsRunner from './UDEXCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(UDEXCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error('App initialization failed', err);

    process.exit(1);
});
