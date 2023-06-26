// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import { tickerData } from '../../test-data.js';
import TickerCollector from '../../../lib/collectors/models/Ticker.js';
import Ticker from '../../../lib/domain-model/entities/Ticker.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();
const tickerId = faker.number.int();

const fetchTickerStubResult = tickerData;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.exchangeAPIStub = {
        fetchTicker: sandbox.stub().resolves(fetchTickerStubResult),
    };

    t.context.TickerStub = {
        create: sandbox.stub(Ticker, 'create'),
    };

    t.context.tickerCollector = new TickerCollector({
        logger: t.context.loggerStub,
        exchange,
        symbol,
        marketId,
        exchangeAPI: t.context.exchangeAPIStub,
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing ticker info', async (t) => {
    const { tickerCollector, exchangeAPIStub } = t.context;

    const result = await tickerCollector.fetchData();

    t.deepEqual(result, fetchTickerStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeAPIStub.fetchTicker));
});

test('save data should call model.create', async (t) => {
    const { tickerCollector } = t.context;

    t.context.TickerStub.create.resolves(tickerId);

    await tickerCollector.saveData(marketId, fetchTickerStubResult);

    t.is(undefined, sinon.assert.calledOnce(t.context.TickerStub.create));
});

test('calls logger if fetch fails', async (t) => {
    const { tickerCollector, exchangeAPIStub, loggerStub } = t.context;

    exchangeAPIStub.fetchTicker.throws();

    await tickerCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});

test('calls logger if save fails', async (t) => {
    const { tickerCollector, TickerStub, loggerStub } = t.context;

    TickerStub.create.throws();

    await tickerCollector.start();

    t.is(undefined, sinon.assert.calledOnce(loggerStub.error));
});
