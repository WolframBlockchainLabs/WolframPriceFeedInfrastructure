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
        await app.resetState();
    });

    it('Should return orderBooks list for specified exchange, pair, and date range', async () => {
        const { marketRecords } = await orderBookStory.setup();
        const targetCandleStick = await orderBookFactory.findOrderBook(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/order-books`)
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
        const { marketRecords } = await orderBookStory.setup();
        const { symbol, intervalStart } = await orderBookFactory.findOrderBook(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/order-books`)
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
        const { marketRecords } = await orderBookStory.setup();
        const { exchangeName, intervalStart } =
            await orderBookFactory.findOrderBook(marketRecords[0].id);

        const serverResponse = await app.request
            .get(`/api/v1/crypto/order-books`)
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
        const { marketRecords } = await orderBookStory.setup();
        const targetCandleStick = await orderBookFactory.findOrderBook(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/order-books`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
                symbol: targetCandleStick.symbol,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(serverResponse.body.error.fields.rangeDateEnd).toEqual(
            'INVALID_ISO_DATE_OR_TIMESTAMP',
        );
    });

    it('Should return an error if the range end date is smaller then range start date', async () => {
        const { marketRecords } = await orderBookStory.setup();
        const targetCandleStick = await orderBookFactory.findOrderBook(
            marketRecords[0].id,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/order-books`)
            .query(`exchangeNames[]=${targetCandleStick.exchangeName}`)
            .query({
                rangeDateStart: targetCandleStick.intervalEnd,
                rangeDateEnd: targetCandleStick.intervalStart,
                symbol: targetCandleStick.symbol,
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(serverResponse.body.error.fields.rangeDateEnd).toEqual(
            'START_DATE_GREATER_THAN_END_DATE',
        );
    });
});
