import GapChecker from '#use-cases/testing/GapChecker.js';
import AppCLIUseCaseProvider from '../AppCLIUseCaseProvider.js';
import './options_schema.js';

async function main() {
    const provider = new AppCLIUseCaseProvider(GapChecker);

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
