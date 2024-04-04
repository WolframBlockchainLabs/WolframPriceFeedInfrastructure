import dumpAggregationTask from '#use-cases/utils/dumps/dumpAggregationTask.js';
import AppE2ETestProvider from '../../AppE2ETestProvider.js';
import AggregationTaskFactory from '../../factories/AggregationTaskFactory.js';

describe('[aggregation-tasks]: Get the record', () => {
    const app = new AppE2ETestProvider();

    const aggregationTaskFactory = new AggregationTaskFactory(app);

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
        const task = await aggregationTaskFactory.createTask();

        const serverResponse = await app.request
            .get(`/api/v1/crypto/aggregation-tasks/${task.id}`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(1);
        expect(serverResponse.body.data).toEqual(dumpAggregationTask(task));
    });

    it('Should return an error if not found', async () => {
        const serverResponse = await app.request
            .get(`/api/v1/crypto/aggregation-tasks/1`)
            .set('Accept', 'application/json')
            .expect(200);

        expect(serverResponse.body.status).toEqual(0);
        expect(serverResponse.body.error.code).toEqual(
            'AGGREGATIONTASK_NOT_FOUND',
        );
    });
});
