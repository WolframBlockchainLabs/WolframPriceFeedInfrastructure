import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import CandleStickFactory from '../../factories/market-records/CandleStickFactory.js';
import CandleStickStory from '../../stories/market-records/CandleStickStory.js';

describe('[candle-stick]: List the records', () => {
    const app = new AppE2ETestProvider();

    const candleStickFactory = new CandleStickFactory(app);
    const candleStickStory = new CandleStickStory(app);

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

    it('Should return candleSticks list for specified exchange and pair', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const { exchangeName, symbol } =
            await candleStickFactory.findCandleStick(candleSticks[0].id);

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks`)
            .query(`exchangeNames[]=${exchangeName}`)
            .query({ symbol })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(3);
    });

    it('Should return candleSticks list for specified exchange, pair, and date range', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: targetCandleStick.intervalStart,
                rangeDateEnd: targetCandleStick.intervalStart,
                symbol: targetCandleStick.symbol,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(1);
        expect(activateResponse.body.data[0]).toEqual(targetCandleStick);
    });

    it('Should return an empty list if the exchange name is wrong', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const { symbol } = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks`)
            .query(`exchangeNames[]=test`)
            .query({ symbol })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const { exchangeName } = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks`)
            .query(`exchangeNames[]=${exchangeName}`)
            .query({ symbol: 'test' })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
                symbol: targetCandleStick.symbol,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(0);
        expect(activateResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(activateResponse.body.error.fields.rangeDateEnd).toEqual(
            'INVALID_ISO_DATE_OR_TIMESTAMP',
        );
    });

    it('Should return an error if the range end date is smaller then range start date', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: targetCandleStick.intervalEnd,
                rangeDateEnd: targetCandleStick.intervalStart,
                symbol: targetCandleStick.symbol,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(0);
        expect(activateResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(activateResponse.body.error.fields.rangeDateEnd).toEqual(
            'START_DATE_GREATER_THAN_END_DATE',
        );
    });
});
