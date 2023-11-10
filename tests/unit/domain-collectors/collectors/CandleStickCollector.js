// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import CandleStickCollector from '../../../../lib/domain-collectors/collectors/CandleStickCollector.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();

const fetchOHLCVStubResult = [
    [faker.number.float(), faker.number.float(), faker.number.float()],
];

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        debug: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeAPIStub = {
        fetchOHLCV: sandbox.stub().resolves(fetchOHLCVStubResult),
        milliseconds: sandbox.stub().resolves(6000),
    };

    t.context.candleStickCollector = new CandleStickCollector({
        logger: t.context.loggerStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    t.context.publishStub = sandbox.stub(
        t.context.candleStickCollector,
        'publish',
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing candleStick info', async (t) => {
    const { candleStickCollector, exchangeAPIStub } = t.context;

    const result = await candleStickCollector.fetchData();

    t.deepEqual(result, fetchOHLCVStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.fetchOHLCV));
});

test('save data should call publish method', async (t) => {
    const { candleStickCollector, publishStub } = t.context;

    await candleStickCollector.saveData(fetchOHLCVStubResult);

    t.is(undefined, sinon.assert.calledOnce(publishStub));
});

test('calls logger if fetch fails', async (t) => {
    const { candleStickCollector, exchangeAPIStub, loggerStub } = t.context;

    exchangeAPIStub.fetchOHLCV.throws();

    try {
        await candleStickCollector.start();

        t.fail();
    } catch {
        t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
    }
});
