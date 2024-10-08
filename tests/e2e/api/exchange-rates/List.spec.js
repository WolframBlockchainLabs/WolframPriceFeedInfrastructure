import EXCEPTION_CODES from '#constants/exceptions/exception-codes.js';
import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import ExchangeRateFactory from '../../factories/market-records/ExchangeRateFactory.js';
import ExchangeRateStory from '../../stories/market-records/ExchangeRateStory.js';

describe('[exchange-rates]: List the records', () => {
    const app = new AppE2ETestProvider();

    const exchangeRateFactory = new ExchangeRateFactory(app);
    const exchangeRateStory = new ExchangeRateStory(app);

    beforeAll(async () => {
        await app.start();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    beforeEach(async () => {
        await app.resetState();
    });

    it('Should return exchangeRates list for specified exchange, pair, and date range', async () => {
        const { marketRecords } = await exchangeRateStory.setup();
        const targetCandleStick = await exchangeRateFactory.findExchangeRate(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/exchange-rates`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: targetCandleStick.intervalStart,
                rangeDateEnd: targetCandleStick.intervalStart,
                symbol: targetCandleStick.symbol,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data.length).toEqual(1);
        expect(serverResponse.body.data[0]).toEqual(targetCandleStick);
    });

    it('Should return an empty list if the exchange name is wrong', async () => {
        const { marketRecords } = await exchangeRateStory.setup();
        const { symbol, intervalStart } =
            await exchangeRateFactory.findExchangeRate(marketRecords[0].id);

        const serverResponse = await app.request
            .get(`/api/v1/crypto/exchange-rates`)
            .query(`exchangeNames[]=test`)
            .query({
                symbol,
                rangeDateStart: intervalStart,
                rangeDateEnd: intervalStart,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { marketRecords } = await exchangeRateStory.setup();
        const { exchangeName, intervalStart } =
            await exchangeRateFactory.findExchangeRate(marketRecords[0].id);

        const serverResponse = await app.request
            .get(`/api/v1/crypto/exchange-rates`)
            .query(`exchangeNames[]=${exchangeName}`)
            .query({
                symbol: 'test',
                rangeDateStart: intervalStart,
                rangeDateEnd: intervalStart,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { marketRecords } = await exchangeRateStory.setup();
        const targetCandleStick = await exchangeRateFactory.findExchangeRate(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/exchange-rates`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
                symbol: targetCandleStick.symbol,
            })
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
        const { marketRecords } = await exchangeRateStory.setup();
        const targetCandleStick = await exchangeRateFactory.findExchangeRate(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/exchange-rates`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: targetCandleStick.intervalEnd,
                rangeDateEnd: targetCandleStick.intervalStart,
                symbol: targetCandleStick.symbol,
            })
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
