// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import ExchangeRateCollector from '../../../../lib/collectors/models/ExchangeRate.js';

let sandbox;

const exchange = 'uniswap_v2';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();

const getExchangeRateStubResult = {
    poolASize: faker.number.float(),
    poolBSize: faker.number.float(),
    exchangeRate: faker.number.float(),
};

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeAPIStub = {
        getExchangeRate: sandbox.stub().resolves(getExchangeRateStubResult),
    };

    t.context.exchangeRateCollector = new ExchangeRateCollector({
        logger: t.context.loggerStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    t.context.publishStub = sandbox.stub(
        t.context.exchangeRateCollector,
        'publish',
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing orderBook info', async (t) => {
    const { exchangeRateCollector, exchangeAPIStub } = t.context;

    const result = await exchangeRateCollector.fetchData();

    t.deepEqual(result, getExchangeRateStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.getExchangeRate));
});

test('save data should call publish method', async (t) => {
    const { exchangeRateCollector, publishStub } = t.context;

    await exchangeRateCollector.saveData(getExchangeRateStubResult);

    t.is(undefined, sinon.assert.calledOnce(publishStub));
});

test('calls logger if fetch fails', async (t) => {
    const { exchangeRateCollector, exchangeAPIStub, loggerStub } = t.context;

    exchangeAPIStub.getExchangeRate.throws();

    await exchangeRateCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});
