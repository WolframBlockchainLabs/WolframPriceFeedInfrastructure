import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import BaseMarketRecordStory from '../../stories/market-records/BaseMarketRecordStory.js';

describe('[markets]: List the records', () => {
    const app = new AppE2ETestProvider();

    const baseMarketRecord = new BaseMarketRecordStory(app);

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

    it('Should return markets list', async () => {
        const { markets } = await baseMarketRecord.setupMarkets();

        const activateResponse = await app.request
            .get(`/api/v1/crypto/markets`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(markets.length);
    });

    it('Should return markets list for specified exchange', async () => {
        const { exchanges, markets } = await baseMarketRecord.setupMarkets();

        const targetExchange = exchanges[0];
        const targetMarkets = markets.filter(
            (market) => market.exchangeId === targetExchange.id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/markets`)
            .query(`exchangeNames[]=${targetExchange.name}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(targetMarkets.length);
    });

    it('Should return markets list for specified exchange', async () => {
        const { markets } = await baseMarketRecord.setupMarkets();

        const targetToken = markets[0].base;
        const targetMarkets = markets.filter((market) => {
            return market.base === targetToken || market.quote === targetToken;
        });

        const activateResponse = await app.request
            .get(`/api/v1/crypto/markets`)
            .query(`tokenNames[]=${targetToken}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(targetMarkets.length);
    });
});
