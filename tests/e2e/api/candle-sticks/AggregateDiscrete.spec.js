import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import { MILLISECONDS_IN_AN_HOUR } from '#constants/timeframes.js';
import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import CandleStickFactory from '../../factories/market-records/CandleStickFactory.js';
import CandleStickStory from '../../stories/market-records/CandleStickStory.js';

describe('[candle-stick]: Aggregate the records discretely', () => {
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
        await app.resetState();
    });

    it('Should return an aggregate of the candleSticks list for specified exchanges and pairs', async () => {
        const { marketRecords } = await candleStickStory.setup();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .query({
                rangeDateStart: targetCandleStick.intervalStart,
                rangeDateEnd: targetCandleStick.intervalEnd,
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data).toMatchObject({
            timeframeMinutes: 60,
            rangeDateStart: '2023-11-15T09:50:00.000Z',
            rangeDateEnd: '2023-11-15T09:51:00.000Z',
            exchangeNames: ['Binance'],
        });
    });

    it('Should handle discreteness specification', async () => {
        const { marketRecords } = await candleStickStory.setup();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            marketRecords[0].id,
        );

        const rangeDateStart = new Date(
            new Date(targetCandleStick.intervalStart).getTime() -
                MILLISECONDS_IN_AN_HOUR,
        ).toISOString();
        const rangeDateEnd = new Date(
            new Date(targetCandleStick.intervalStart).getTime() +
                MILLISECONDS_IN_AN_HOUR,
        ).toISOString();

        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .query({
                rangeDateStart,
                rangeDateEnd,
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query(`timeframeMinutes=2`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data).toMatchObject({
            timeframeMinutes: 2,
            rangeDateStart,
            rangeDateEnd,
            exchangeNames: ['Binance'],
        });
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { marketRecords } = await candleStickStory.setup();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .set('Accept', 'application/json')
            .expect(400);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual(
            EXCEPTION_CODES.FORMAT_ERROR,
        );
        expect(serverResponse.body.error.fields.rangeDateEnd).toEqual(
            'INVALID_ISO_DATE_OR_TIMESTAMP',
        );
    });

    it('Should return an error if the range end date is smaller then range start date', async () => {
        const { marketRecords } = await candleStickStory.setup();
        const targetCandleStick = await candleStickFactory.findCandleStick(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .query({
                rangeDateStart: targetCandleStick.intervalEnd,
                rangeDateEnd: targetCandleStick.intervalStart,
            })
            .query(`symbols[]=${targetCandleStick.symbol}`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .set('Accept', 'application/json')
            .expect(400);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual(
            EXCEPTION_CODES.FORMAT_ERROR,
        );
        expect(serverResponse.body.error.fields.rangeDateEnd).toEqual(
            'START_DATE_GREATER_THAN_END_DATE',
        );
    });
});
