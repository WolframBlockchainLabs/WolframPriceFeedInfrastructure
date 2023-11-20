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
        await app.testDBManager.truncateAllTables();
    });

    afterEach(async () => {
        await app.testDBManager.truncateAllTables();
    });

    it('Should return exchangeRates list for specified exchange and pair', async () => {
        const { exchangeRates } = await exchangeRateStory.setupExchangeRates();
        const { exchangeName, symbol } =
            await exchangeRateFactory.findExchangeRate(exchangeRates[0].id);
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${exchangeName}/markets/${encodedSymbol}/exchangeRates`,
            )
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(3);
    });

    it('Should return exchangeRates list for specified exchange, pair, and date range', async () => {
        const { exchangeRates } = await exchangeRateStory.setupExchangeRates();
        const targetCandleStick = await exchangeRateFactory.findExchangeRate(
            exchangeRates[0].id,
        );
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/exchangeRates`,
            )
            .query({
                rangeDateStart: targetCandleStick.intervalStart,
                rangeDateEnd: targetCandleStick.intervalStart,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(1);
        expect(activateResponse.body.data[0]).toEqual(targetCandleStick);
    });

    it('Should return an empty list if the exchange name is wrong', async () => {
        const { exchangeRates } = await exchangeRateStory.setupExchangeRates();
        const { symbol } = await exchangeRateFactory.findExchangeRate(
            exchangeRates[0].id,
        );
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/test/markets/${encodedSymbol}/exchangeRates`,
            )
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { exchangeRates } = await exchangeRateStory.setupExchangeRates();
        const { exchangeName } = await exchangeRateFactory.findExchangeRate(
            exchangeRates[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/${exchangeName}/markets/test/exchangeRates`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { exchangeRates } = await exchangeRateStory.setupExchangeRates();
        const targetCandleStick = await exchangeRateFactory.findExchangeRate(
            exchangeRates[0].id,
        );
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/exchangeRates`,
            )
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
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
        const { exchangeRates } = await exchangeRateStory.setupExchangeRates();
        const targetCandleStick = await exchangeRateFactory.findExchangeRate(
            exchangeRates[0].id,
        );
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/exchangeRates`,
            )
            .query({
                rangeDateStart: targetCandleStick.intervalEnd,
                rangeDateEnd: targetCandleStick.intervalStart,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(0);
        expect(activateResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(activateResponse.body.error.fields.rangeDateEnd).toEqual(
            'DATE START CANNOT BE LATE THAN DATA END',
        );
    });
});
