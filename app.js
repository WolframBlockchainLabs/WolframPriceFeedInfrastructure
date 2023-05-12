import AppProvider from './lib/AppProvider.js';

async function main() {
    const provider = AppProvider.create();

    provider.initApp().start();
}

main().catch((err) => {
    console.error(err);

    // eslint-disable-next-line no-undef
    process.exit(1);
});
