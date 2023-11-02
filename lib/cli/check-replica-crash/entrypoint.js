import AppFiniteCLIProvider from '../AppFiniteCLIProvider.js';
import CheckReplicaCrashRunner from './CheckReplicaCrashRunner.js';

async function main() {
    const provider = new AppFiniteCLIProvider(CheckReplicaCrashRunner);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
