import AppCLIProvider from '../AppCLIProvider.js';
import XRPLCollectorsRunner from './XRPLCollectorsRunner.js';

async function main() {
    const provider = new AppCLIProvider(XRPLCollectorsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
