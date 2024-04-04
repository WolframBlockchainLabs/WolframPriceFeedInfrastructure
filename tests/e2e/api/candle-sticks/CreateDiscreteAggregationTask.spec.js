import AggregationTask from '#domain-model/entities/AggregationTask.js';
import AppE2ETestProvider from '../../AppE2ETestProvider.js';

describe('[candle-stick]: Create discrete aggregation task', () => {
    const app = new AppE2ETestProvider();

    beforeAll(async () => {
        await app.start();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    beforeEach(async () => {
        await app.resetState();
    });

    it('Should return created discrete aggregation task and notify aggregator worker', async () => {
        const serverResponse = await app.request
            .post(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .send({
                rangeDateStart: '2024-04-04T08:58:58.366Z',
                rangeDateEnd: '2024-04-04T12:58:58.366Z',
                symbols: ['BTC/USDT'],
                exchangeNames: ['Binance'],
            })
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data.type).toEqual(
            AggregationTask.TYPE.CANDLES_DISCRETE_AGGREGATION,
        );
        expect(app.amqpClient.publish).toHaveBeenCalled();
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const serverResponse = await app.request
            .post(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .send({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
                symbols: ['BTC/USDT'],
                exchangeNames: ['Binance'],
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
        const serverResponse = await app.request
            .post(`/api/v1/crypto/candle-sticks/aggregate-discrete`)
            .send({
                rangeDateStart: '2024-04-04T08:58:58.366Z',
                rangeDateEnd: '2024-04-04T06:58:58.366Z',
                symbols: ['BTC/USDT'],
                exchangeNames: ['Binance'],
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
