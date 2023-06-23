/* eslint-disable no-unused-vars */
import test from 'ava';
import sinon from 'sinon';
import ccxt from 'ccxt';
import { faker } from '@faker-js/faker';
import { CandleStickCollector } from '../../../lib/collectors/ccxt/CandleStick.js';

let sandbox;

let sequelize;

let ccxtStub;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const marketId = faker.number.int();
const candleStickId = faker.number.int();

const fetchOHLCVStubResult = [
    [faker.number.float(), faker.number.float(), faker.number.float()],
];

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    sequelize = {
        CandleStick: {
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
        fetchOHLCV: sandbox.stub().resolves(fetchOHLCVStubResult),
        milliseconds: sandbox.stub().resolves(6000),
    });

    t.context.candleStickCollector = new CandleStickCollector(
        { exchange, symbol },
        sequelize,
        marketId,
    );
});

test.afterEach(() => {
    sandbox.restore();
});

test('fetch data should return existing candleStick info', async (t) => {
    const { candleStickCollector } = t.context;
    const exchangeApiStub = new ccxt[exchange]();

    const result = await candleStickCollector.fetchData();

    t.deepEqual(result, fetchOHLCVStubResult);
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.loadMarkets));
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.fetchOHLCV));
});

test('save data should call model.create', async (t) => {
    const { candleStickCollector } = t.context;

    candleStickCollector.sequelize.CandleStick.create.resolves(candleStickId);

    await candleStickCollector.saveData(fetchOHLCVStubResult, marketId);

    t.is(undefined, sinon.assert.calledOnce(sequelize.CandleStick.create));
});
