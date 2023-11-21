import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import ExchangeFactory from '../../factories/ExchangeFactory.js';

describe('[exchanges]: List the records', () => {
    const app = new AppE2ETestProvider();

    const exchangeFactory = new ExchangeFactory(app);

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

    it('Should return exchanges list', async () => {
        const exchanges = await exchangeFactory.createExchanges();

        const activateResponse = await app.request
            .get(`/api/v1/exchanges`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(exchanges.length);
    });
});