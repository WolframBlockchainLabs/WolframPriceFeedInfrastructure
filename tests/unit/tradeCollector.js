/* eslint-disable no-magic-numbers */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import test from 'ava';
import sinon from 'sinon';
import ccxt from 'ccxt';
import { faker } from '@faker-js/faker';
import { TradeCollector } from '../../lib/collectors/Trade.js';

let sandbox;

let sequelize;

let ccxtStub;

let fetchedData;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();
const tradeId = faker.number.int();

const fetchTradeStubResult = [
    { side: 'sell', price: 0.066754, amount: 0.055, timestamp: 1684141361369 },
];

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    sequelize = {
        Trade: {
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
        fetchTrades: sandbox.stub().resolves(fetchTradeStubResult),
        milliseconds: sandbox.stub().resolves(6000),
    });

    t.context.tradeCollector = new TradeCollector(
        { exchange, symbol },
        sequelize,
        marketId,
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing trade info', async (t) => {
    const { tradeCollector } = t.context;
    const exchangeApiStub = new ccxt[exchange]();

    fetchedData = await tradeCollector.fetchData();

    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.loadMarkets));
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.fetchTrades));
});

test('save data should call model.create', async (t) => {
    const { tradeCollector } = t.context;

    tradeCollector.sequelize.Trade.create.resolves(tradeId);

    await tradeCollector.saveData(marketId, fetchedData);

    t.is(undefined, sinon.assert.calledOnce(sequelize.Trade.create));
});
