import ReplicaCrashChecker from '#use-cases/testing/ReplicaCrashChecker.js';
import AppCLIUseCaseProvider from '../AppCLIUseCaseProvider.js';
import './options_schema.js';

async function main() {
    const provider = new AppCLIUseCaseProvider(ReplicaCrashChecker);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
