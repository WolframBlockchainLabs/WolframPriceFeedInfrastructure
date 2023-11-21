import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import TickerFactory from '../../factories/market-records/TickerFactory.js';
import TickerStory from '../../stories/market-records/TickerStory.js';

describe('[tickers]: List the records', () => {
    const app = new AppE2ETestProvider();

    const tickerFactory = new TickerFactory(app);
    const tickerStory = new TickerStory(app);

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

    it('Should return tickers list for specified exchange and pair', async () => {
        const { tickers } = await tickerStory.setupTickers();
        const { exchangeName, symbol } = await tickerFactory.findTicker(
            tickers[0].id,
        );
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${exchangeName}/markets/${encodedSymbol}/tickers`,
            )
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(3);
    });

    it('Should return tickers list for specified exchange, pair, and date range', async () => {
        const { tickers } = await tickerStory.setupTickers();
        const targetCandleStick = await tickerFactory.findTicker(tickers[0].id);
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/tickers`,
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
        const { tickers } = await tickerStory.setupTickers();
        const { symbol } = await tickerFactory.findTicker(tickers[0].id);
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/test/markets/${encodedSymbol}/tickers`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { tickers } = await tickerStory.setupTickers();
        const { exchangeName } = await tickerFactory.findTicker(tickers[0].id);

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/${exchangeName}/markets/test/tickers`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { tickers } = await tickerStory.setupTickers();
        const targetCandleStick = await tickerFactory.findTicker(tickers[0].id);
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/tickers`,
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
        const { tickers } = await tickerStory.setupTickers();
        const targetCandleStick = await tickerFactory.findTicker(tickers[0].id);
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/tickers`,
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