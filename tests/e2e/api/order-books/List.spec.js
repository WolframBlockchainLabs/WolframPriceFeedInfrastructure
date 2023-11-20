import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import OrderBookFactory from '../../factories/market-records/OrderBookFactory.js';
import OrderBookStory from '../../stories/market-records/OrderBookStory.js';

describe('[order-books]: List the records', () => {
    const app = new AppE2ETestProvider();

    const orderBookFactory = new OrderBookFactory(app);
    const orderBookStory = new OrderBookStory(app);

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

    it('Should return orderBooks list for specified exchange and pair', async () => {
        const { orderBooks } = await orderBookStory.setupOrderBooks();
        const { exchangeName, symbol } = await orderBookFactory.findOrderBook(
            orderBooks[0].id,
        );
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${exchangeName}/markets/${encodedSymbol}/orderBooks`,
            )
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(3);
    });

    it('Should return orderBooks list for specified exchange, pair, and date range', async () => {
        const { orderBooks } = await orderBookStory.setupOrderBooks();
        const targetCandleStick = await orderBookFactory.findOrderBook(
            orderBooks[0].id,
        );
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/orderBooks`,
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
        const { orderBooks } = await orderBookStory.setupOrderBooks();
        const { symbol } = await orderBookFactory.findOrderBook(
            orderBooks[0].id,
        );
        const encodedSymbol = symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/test/markets/${encodedSymbol}/orderBooks`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an empty list if the market name is wrong', async () => {
        const { orderBooks } = await orderBookStory.setupOrderBooks();
        const { exchangeName } = await orderBookFactory.findOrderBook(
            orderBooks[0].id,
        );

        const activateResponse = await app.request
            .get(`/api/v1/exchanges/${exchangeName}/markets/test/orderBooks`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(activateResponse.body.status).toEqual(1);
        expect(activateResponse.body.data.length).toEqual(0);
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const { orderBooks } = await orderBookStory.setupOrderBooks();
        const targetCandleStick = await orderBookFactory.findOrderBook(
            orderBooks[0].id,
        );
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/orderBooks`,
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
        const { orderBooks } = await orderBookStory.setupOrderBooks();
        const targetCandleStick = await orderBookFactory.findOrderBook(
            orderBooks[0].id,
        );
        const encodedSymbol = targetCandleStick.symbol.replace(/\//g, '_');

        const activateResponse = await app.request
            .get(
                `/api/v1/exchanges/${targetCandleStick.exchangeName}/markets/${encodedSymbol}/orderBooks`,
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
