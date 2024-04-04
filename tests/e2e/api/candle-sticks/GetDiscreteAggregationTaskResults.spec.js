import dumpAggregationTask from '#use-cases/utils/dumps/dumpAggregationTask.js';
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

describe('[candle-stick]: Get discrete aggregation task results', () => {
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
        const task =
            await discreteCandlesAggregationTaskStory.setupCompletedTask(
                AGGREGATION_PARAMS_SAMPLE,
                AGGREGATION_RESULTS_SAMPLE,
            );

        const serverResponse = await app.request
            .get(
                `/api/v1/crypto/candle-sticks/aggregate-discrete/results/${task.id}`,
            )
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data.task).toEqual(
            dumpAggregationTask(task),
        );
        expect(serverResponse.body.data.results).toMatchObject(
            AGGREGATION_TASKS_RESULTS,
        );
    });

    it('Should return an error if not found', async () => {
        const serverResponse = await app.request
            .get(`/api/v1/crypto/candle-sticks/aggregate-discrete/results/1`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual(
            'AGGREGATIONTASK_NOT_FOUND',
        );
    });
});
