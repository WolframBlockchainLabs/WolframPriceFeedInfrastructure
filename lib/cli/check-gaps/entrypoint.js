import AppFiniteCLIProvider from '../AppFiniteCLIProvider.js';
import CheckGapsRunner from './CheckGapsRunner.js';

async function main() {
    const provider = new AppFiniteCLIProvider(CheckGapsRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
