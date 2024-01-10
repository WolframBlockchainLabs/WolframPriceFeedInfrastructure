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
        await app.resetState();
    });

    it('Should return trades list for specified exchange, pair, and date range', async () => {
        const { trades } = await tradeStory.setupTrades();
        const targetCandleStick = await tradeFactory.findTrade(trades[0].id);

        const activateResponse = await app.request
            .get(`/api/v1/crypto/trades`)
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
        const { trades } = await tradeStory.setupTrades();
        const { symbol, intervalStart } = await tradeFactory.findTrade(
            trades[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/trades`)
            .query(`exchangeNames[]=test`)
            .query({
                symbol,
                rangeDateStart: intervalStart,
                rangeDateEnd: intervalStart,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { trades } = await tradeStory.setupTrades();
        const { exchangeName, intervalStart } = await tradeFactory.findTrade(
            trades[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/crypto/trades`)
            .query(`exchangeNames[]=${exchangeName}`)
            .query({
                symbol: 'test',
                rangeDateStart: intervalStart,
                rangeDateEnd: intervalStart,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { trades } = await tradeStory.setupTrades();
        const targetCandleStick = await tradeFactory.findTrade(trades[0].id);

        const activateResponse = await app.request
            .get(`/api/v1/crypto/trades`)
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
        const { trades } = await tradeStory.setupTrades();
        const targetCandleStick = await tradeFactory.findTrade(trades[0].id);

        const activateResponse = await app.request
            .get(`/api/v1/crypto/trades`)
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
