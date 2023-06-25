import test from 'ava';
import sinon from 'sinon';
import { faker } from '@faker-js/faker';
import MarketService from '../../lib/collectors/MarketService.js';
import Exchange from '../../lib/domain-model/entities/Exchange.js';
import Market from '../../lib/domain-model/entities/Market.js';
import testLogger from '../testLogger.js';

let sandbox;

const exchange = 'binance';
const symbol = 'BTC/USDT';
const exchangeFindOneStubResult = { id: faker.number.int() };
const marketFindOneStubResult = { id: faker.number.int() };
const createResult = faker.number.int();

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.exchangeAPIStub = {
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
    };

    t.context.ExchangeStub = {
        findOne: sandbox.stub(Exchange, 'findOne'),
    };

    t.context.MarketStub = {
        findOne: sandbox.stub(Market, 'findOne'),
        create: sandbox.stub(Market, 'create'),
    };
});

test.afterEach(() => {
    sandbox.restore();
});

test('getMarketInfo should return existing market info', async (t) => {
    const marketService = new MarketService({
        logger: testLogger,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    const createMarketStub = sandbox.stub(
        MarketService.prototype,
        'createMarket',
    );

    t.context.ExchangeStub.findOne.resolves(exchangeFindOneStubResult);
    t.context.MarketStub.findOne.resolves(marketFindOneStubResult);

    const result = await marketService.getMarketInfo(exchange, symbol);

    t.is(result.marketId, marketFindOneStubResult.id);
    t.is(undefined, sinon.assert.calledOnce(t.context.ExchangeStub.findOne));
    t.is(undefined, sinon.assert.calledOnce(t.context.MarketStub.findOne));
    t.is(undefined, sinon.assert.notCalled(createMarketStub));
});

test('getMarketInfo should create a new market', async (t) => {
    const marketService = new MarketService({
        logger: testLogger,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    const createMarketStub = sandbox.stub(
        MarketService.prototype,
        'createMarket',
    );

    t.context.ExchangeStub.findOne.resolves(exchangeFindOneStubResult);
    t.context.MarketStub.findOne.resolves(null);

    createMarketStub.resolves(createResult);

    const actualResult = await marketService.getMarketInfo(exchange, symbol);

    t.is(createResult, actualResult.marketId);
    t.is(undefined, sinon.assert.calledOnce(t.context.ExchangeStub.findOne));
    t.is(undefined, sinon.assert.calledOnce(t.context.MarketStub.findOne));
    t.is(
        undefined,
        sinon.assert.calledOnceWithExactly(createMarketStub, {
            exchange,
            exchangeId: exchangeFindOneStubResult.id,
            symbol,
        }),
    );
});

test('createMarket should create a new market', async (t) => {
    const marketService = new MarketService({
        logger: testLogger,
        exchangeAPI: t.context.exchangeAPIStub,
    });

    t.context.MarketStub.create.resolves(marketFindOneStubResult);

    const result = await marketService.createMarket({
        exchange,
        exchangeId: exchangeFindOneStubResult.id,
        symbol,
    });

    t.is(result, marketFindOneStubResult.id);
    t.is(
        undefined,
        sinon.assert.calledOnce(t.context.exchangeAPIStub.loadMarkets),
    );
    t.is(undefined, sinon.assert.calledOnce(t.context.MarketStub.create));
});
