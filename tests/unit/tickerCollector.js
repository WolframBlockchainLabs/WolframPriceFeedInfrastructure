/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import test from 'ava';
import sinon from 'sinon';
import ccxt from 'ccxt';
import { faker } from '@faker-js/faker';
import { TickerCollector } from '../../lib/collectors/Ticker.js';
import { initLogger } from '../../lib/infrastructure/logger/logger.js';
import { tickerData } from '../test-data.js';

let sandbox;

let sequelize;

let ccxtStub;

initLogger();

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();
const tickerId = faker.number.int();

const fetchTickerStubResult = tickerData;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    sequelize = {
        Ticker: {
            create: sinon.stub(),
        },
    };

    ccxtStub = sandbox.stub(ccxt, 'binance').returns({
        loadMarkets: sandbox.stub().resolves({
            [symbol]: {
                id: 'externalMarketId',
                base: 'base',
                quote: 'quote',
                baseId: 'baseId',
                quoteId: 'quoteId',
                active: true,
            },
        }),
        fetchTicker: sandbox.stub().resolves(fetchTickerStubResult),
    });

    t.context.tickerCollector = new TickerCollector(
        { exchange, symbol },
        sequelize,
        marketId,
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing ticker info', async (t) => {
    const { tickerCollector } = t.context;
    const exchangeApiStub = new ccxt[exchange]();

    const result = await tickerCollector.fetchData();

    t.deepEqual(result, fetchTickerStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.loadMarkets));
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.fetchTicker));
});

test('save data should call model.create', async (t) => {
    const { tickerCollector } = t.context;

    tickerCollector.sequelize.Ticker.create.resolves(tickerId);

    await tickerCollector.saveData(marketId, fetchTickerStubResult);

    t.is(undefined, sinon.assert.calledOnce(sequelize.Ticker.create));
});
