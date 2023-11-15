import AppE2ETestProvider from '../../AppE2ETestProvider.js';

describe('[candle-stick]: List the records', () => {
    const app = new AppE2ETestProvider();

    beforeAll(async () => {
        await app.start();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    beforeEach(async () => {
        await app.testDBManager.truncateAllTables();
    });

    afterEach(async () => {
        await app.testDBManager.truncateAllTables();
    });

    it('Test', () => {
        console.log('PASS');
    });
});
