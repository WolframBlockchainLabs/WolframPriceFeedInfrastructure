import CheckCryptoMarketsGapsUseCase from '#use-cases/testing/CheckCryptoMarketsGapsUseCase.js';
import AppCLIUseCaseProvider from '../AppCLIUseCaseProvider.js';
import './options_schema.js';

async function main() {
    const provider = new AppCLIUseCaseProvider(CheckCryptoMarketsGapsUseCase);

    await provider.start();
}

main().catch((err) => {
    console.error('App initialization failed', err);

    process.exit(1);
});
