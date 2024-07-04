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
        await app.resetState();
    });

    it('Should return exchanges list', async () => {
        const exchanges = await exchangeFactory.create();

        const serverResponse = await app.request
            .get(`/api/v1/crypto/exchanges`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data.length).toEqual(exchanges.length);
    });
});
