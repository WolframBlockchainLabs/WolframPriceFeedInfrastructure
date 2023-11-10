// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import HistoricalScheduler from '../../../../lib/domain-collectors/infrastructure/HistoricalScheduler.js';

let sandbox;

const scheduleStartDate = new Date('2023-11-7 12:53:44+0000');
const scheduleEndDate = new Date('2023-11-10 12:53:44+0000');

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.setTimeoutStub = sandbox
        .stub(global, 'setTimeout')
        .callsFake((cb) => cb());

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.historicalScheduler = new HistoricalScheduler({
        logger: t.context.loggerStub,
        scheduleStartDate,
        scheduleEndDate,
        baseRateLimit: 50,
        rateLimitMargin: 10,
        operationsAmount: 4,
        queuePosition: 3,
        queueSize: 5,
        replicaSize: 2,
        instancePosition: 1,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the "start" method should call parent start and handleStop.', async (t) => {
    const { historicalScheduler } = t.context;

    const startStub = sandbox.stub(
        Object.getPrototypeOf(HistoricalScheduler.prototype),
        'start',
    );
    const handleStopStub = sandbox.stub(historicalScheduler, 'handleStop');

    await historicalScheduler.start({});

    sinon.assert.calledOnce(startStub);
    sinon.assert.calledOnce(handleStopStub);

    t.pass();
});

test('the "updateIntervalBounds" should update scheduler state.', async (t) => {
    const { historicalScheduler } = t.context;

    historicalScheduler.updateIntervalBounds();
    t.is(historicalScheduler.cycleCounter, 1);

    historicalScheduler.updateIntervalBounds();
    t.is(historicalScheduler.cycleCounter, 2);

    historicalScheduler.updateIntervalBounds();
    t.is(historicalScheduler.cycleCounter, 3);
});

test('the "handleStop" method should call stop method after all cycle are completed.', async (t) => {
    const { historicalScheduler, setTimeoutStub } = t.context;

    const stopStub = sandbox.stub(historicalScheduler, 'stop');

    await historicalScheduler.handleStop();

    sinon.assert.calledOnce(stopStub);
    sinon.assert.calledOnce(setTimeoutStub);

    t.pass();
});

test('calculateLastCycleLimit should return remainingMinutes if it is not falsy', (t) => {
    const { historicalScheduler } = t.context;

    historicalScheduler.collectionStartDate = new Date('2023-01-01T00:00:00Z');
    historicalScheduler.collectionEndDate = new Date('2023-01-01T01:00:00Z');
    historicalScheduler.operationLimit = 60;

    const expectedRemainingMinutes = 60;
    const result = historicalScheduler.calculateLastCycleLimit();

    t.is(result, expectedRemainingMinutes);
});

test('calculateLastCycleLimit should return operationLimit if remainingMinutes is 0', (t) => {
    const { historicalScheduler } = t.context;

    historicalScheduler.collectionStartDate = new Date('2023-01-01T00:00:00Z');
    historicalScheduler.collectionEndDate = new Date('2023-01-01T00:00:00Z');
    historicalScheduler.operationLimit = 60;

    const result = historicalScheduler.calculateLastCycleLimit();

    t.is(result, historicalScheduler.operationLimit);
});

test('updateIntervalBounds should handle normal cycle correctly', (t) => {
    const { historicalScheduler } = t.context;

    historicalScheduler.cycleCounter = 0;
    historicalScheduler.totalCycles = 2;
    historicalScheduler.operationLimit = 60;
    historicalScheduler.collectionStartDate = new Date('2023-01-01T00:00:00Z');

    historicalScheduler.updateIntervalBounds();

    t.is(historicalScheduler.cycleCounter, 1);
});

test('updateIntervalBounds should handle final cycle correctly', (t) => {
    const { historicalScheduler } = t.context;

    historicalScheduler.cycleCounter = 1;
    historicalScheduler.totalCycles = 2;
    historicalScheduler.lastCycleLimit = 30;
    historicalScheduler.collectionStartDate = new Date('2023-01-01T00:00:00Z');

    historicalScheduler.updateIntervalBounds();

    t.is(historicalScheduler.cycleCounter, 2);
});
