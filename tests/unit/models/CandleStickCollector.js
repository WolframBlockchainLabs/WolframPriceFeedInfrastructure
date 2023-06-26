// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import CandleStickCollector from '../../../lib/collectors/models/CandleStick.js';
import CandleStick from '../../../lib/domain-model/entities/CandleStick.js';
import testLogger from '../../testLogger.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();
const candleStickId = faker.number.int();

const fetchOHLCVStubResult = [
    [faker.number.float(), faker.number.float(), faker.number.float()],
];

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.exchangeAPIStub = {
        fetchOHLCV: sandbox.stub().resolves(fetchOHLCVStubResult),
        milliseconds: sandbox.stub().resolves(6000),
    };

    t.context.CandleStickStub = {
        create: sandbox.stub(CandleStick, 'create'),
    };

    t.context.candleStickCollector = new CandleStickCollector({
        logger: testLogger,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });
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

test('save data should call model.create', async (t) => {
    const { candleStickCollector } = t.context;

    t.context.CandleStickStub.create.resolves(candleStickId);

    await candleStickCollector.saveData(fetchOHLCVStubResult, marketId);

    t.is(undefined, sinon.assert.calledOnce(t.context.CandleStickStub.create));
});
