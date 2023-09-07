import CardanoCollectorsProvider from './CardanoCollectorsProvider.js';

async function main() {
    const provider = new CardanoCollectorsProvider();

    await provider.start();
}

main().catch((err) => {
    console.error(err);

    process.exit(1);
});
