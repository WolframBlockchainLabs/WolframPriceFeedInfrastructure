import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import DiscreteCandlesAggregationTaskStory from '../../stories/DiscreteCandlesAggregationTaskStory.js';

const AGGREGATION_RESULTS_SAMPLE = {
    timeframeMinutes: 60,
    rangeDateStart: '2024-04-01 08:38:37',
    rangeDateEnd: '2024-04-01 23:38:34',
    exchangeNames: ['Binance'],
    pairs: [
        {
            symbol: 'BTC/USDT',
            processedCount: 891,
            count: 2,
            candles: [
                {
                    timestamp: 1711960717000,
                    open: 69565.8,
                    high: 69616.65,
                    low: 69429.72,
                    close: 69495,
                    volume: 807.9433083799998,
                    aggregatedAveragePrice: 69523.185,
                },
                {
                    timestamp: 1711964317000,
                    open: 69491.8,
                    high: 69539.8,
                    low: 69346.7,
                    close: 69350.1,
                    volume: 1030.372812450003,
                    aggregatedAveragePrice: 69443.25,
                },
            ],
        },
    ],
};

const AGGREGATION_PARAMS_SAMPLE = {
    timeframeMinutes: 60,
    rangeDateStart: '2024-04-01 08:38:37',
    rangeDateEnd: '2024-04-01 23:38:34',
    exchangeNames: ['Binance'],
};

const AGGREGATION_TASKS_RESULTS = [
    {
        id: '1',
        symbol: 'BTC/USDT',
        rangeDateStart: '2024-04-01T08:38:37.000Z',
        rangeDateEnd: '2024-04-01T23:38:34.000Z',
        timeframeMinutes: 60,
        processedCount: 891,
        count: 2,
        candles: [
            {
                timestamp: 1711960717000,
                open: 69565.8,
                high: 69616.65,
                low: 69429.72,
                close: 69495,
                volume: 807.9433083799998,
                aggregatedAveragePrice: 69523.185,
            },
            {
                timestamp: 1711964317000,
                open: 69491.8,
                high: 69539.8,
                low: 69346.7,
                close: 69350.1,
                volume: 1030.372812450003,
                aggregatedAveragePrice: 69443.25,
            },
        ],
        taskId: '1',
    },
];
describe('[candle-stick]: List discrete aggregation task results', () => {
    const app = new AppE2ETestProvider();

    const discreteCandlesAggregationTaskStory =
        new DiscreteCandlesAggregationTaskStory(app);

    beforeAll(async () => {
        await app.start();
    });

    afterAll(async () => {
        await app.shutdown();
    });

    beforeEach(async () => {
        await app.resetState();
    });

    it('Should return aggregation-task by id', async () => {
        await discreteCandlesAggregationTaskStory.setupCompletedTask(
            AGGREGATION_PARAMS_SAMPLE,
            AGGREGATION_RESULTS_SAMPLE,
        );

        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete/results`)
            .query({
                rangeDateStart: '2024-04-01T06:38:37.000Z',
                rangeDateEnd: '2024-04-01T23:58:34.000Z',
            })
            .query(`symbols[]=BTC/USDT`)
            .query(`exchangeNames[]=Binance`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);

        expect(serverResponse.body.data).toMatchObject(
            AGGREGATION_TASKS_RESULTS,
        );
    });

    it('Should return an error if the date range is ill-formatted', async () => {
        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete/results`)
            .query({
                rangeDateStart: 'targetCandleStick.intervalEnd',
                rangeDateEnd: 'targetCandleStick.intervalStart',
            })
            .query(`symbols[]=BTC/USDT`)
            .query(`exchangeNames[]=Binance`)
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
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete/results`)
            .query({
                rangeDateStart: '2024-04-04T08:58:58.366Z',
                rangeDateEnd: '2024-04-04T06:58:58.366Z',
            })
            .query(`symbols[]=BTC/USDT`)
            .query(`exchangeNames[]=Binance`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual('FORMAT_ERROR');
        expect(serverResponse.body.error.fields.rangeDateEnd).toEqual(
            'START_DATE_GREATER_THAN_END_DATE',
        );
    });
});
