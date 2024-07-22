import XRPLCollectorsRunner from './XRPLCollectorsRunner.js';
import AppCLIProvider from '../../AppCLIProvider.js';

async function main() {
    const provider = new AppCLIProvider(XRPLCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error('App initialization failed', err);

    process.exit(1);
});
