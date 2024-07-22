import AppProvider from './AppProvider.js';

async function main() {
    const provider = new AppProvider();

    await provider.start();
}

main().catch((err) => {
    console.error('App initialization failed', err);

    process.exit(1);
});
