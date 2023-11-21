import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import TradeFactory from '../../factories/market-records/TradeFactory.js';
import TradeStory from '../../stories/market-records/TradeStory.js';

describe('[trades]: List the records', () => {
    const app = new AppE2ETestProvider();

    const tradeFactory = new TradeFactory(app);
    const tradeStory = new TradeStory(app);

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

    it('Should return trades list for specified exchange and pair', async () => {
        const { trades } = await tradeStory.setupTrades();
        const { exchangeName, symbol } = await tradeFactory.findTrade(
            trades[0].id,
        );
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${exchangeName}/markets/${encodedSymbol}/trades`,
            )
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(3);
    });

    it('Should return trades list for specified exchange, pair, and date range', async () => {
        const { trades } = await tradeStory.setupTrades();
        const targetCandleStick = await tradeFactory.findTrade(trades[0].id);
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/trades`,
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
        const { trades } = await tradeStory.setupTrades();
        const { symbol } = await tradeFactory.findTrade(trades[0].id);
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/test/markets/${encodedSymbol}/trades`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { trades } = await tradeStory.setupTrades();
        const { exchangeName } = await tradeFactory.findTrade(trades[0].id);

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/${exchangeName}/markets/test/trades`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { trades } = await tradeStory.setupTrades();
        const targetCandleStick = await tradeFactory.findTrade(trades[0].id);
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/trades`,
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
        const { trades } = await tradeStory.setupTrades();
        const targetCandleStick = await tradeFactory.findTrade(trades[0].id);
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/trades`,
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