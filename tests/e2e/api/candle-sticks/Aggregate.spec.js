import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import CandleStickFactory from '../../factories/market-records/CandleStickFactory.js';
import CandleStickStory from '../../stories/market-records/CandleStickStory.js';

describe('[candle-stick]: Aggregate the records', () => {
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

    it('Should return an aggregate of the candleSticks list for specified exchanges and pairs', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks/aggregate`)
            .query({
                rangeDateStart: targetCandleStick.intervalStart,
                rangeDateEnd: targetCandleStick.intervalEnd,
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.rangeDateStart).toEqual(
            targetCandleStick.intervalStart,
        );
        expect(activateResponse.body.data.rangeDateEnd).toEqual(
            targetCandleStick.intervalEnd,
        );
        expect(
            activateResponse.body.data.aggregatedPairs[
                targetCandleStick.symbol
            ],
        ).toBeTruthy();
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { candleSticks } = await candleStickStory.setupCandleSticks();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            candleSticks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/candleSticks/aggregate`)
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
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
            .get(`/api/v1/crypto/candleSticks/aggregate`)
            .query({
                rangeDateStart: targetCandleStick.intervalEnd,
                rangeDateEnd: targetCandleStick.intervalStart,
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(0);
        expect(activateResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(activateResponse.body.error.fields.rangeDateEnd).toEqual(
            'DATE START CANNOT BE LATE THAN DATA END',
        );
    });
});
