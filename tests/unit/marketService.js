/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
import test from 'ava';
import sinon from 'sinon';
import ccxt from 'ccxt';
import { faker } from '@faker-js/faker';
import { MarketService } from '../../lib/collectors/MarketService.js/index.js';
import { initLogger } from '../../lib/infrastructure/logger/logger.js';

let sandbox;

let sequelize;

let ccxtStub;

initLogger();

const exchange = 'binance';
const symbol = 'BTC/USDT';
const exchangeFindOneStubResult = { id: faker.number.int() };
const marketFindOneStubResult = { id: faker.number.int() };
const createResult = faker.number.int();

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    sequelize = {
        Exchange: {
            findOne: sinon.stub(),
        },
        Market: {
            findOne: sinon.stub(),
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
    });

    t.context.marketService = new MarketService(sequelize);
});

test.afterEach(() => {
    sandbox.restore();
});

test('getMarketInfo should return existing market info', async (t) => {
    const { marketService } = t.context;
    const createMarketStub = sandbox.stub(
        MarketService.prototype,
        'createMarket',
    );

    marketService.sequelize.Exchange.findOne.resolves(
        exchangeFindOneStubResult,
    );
    marketService.sequelize.Market.findOne.resolves(marketFindOneStubResult);

    const result = await marketService.getMarketInfo(exchange, symbol);

    t.is(result.marketId, marketFindOneStubResult.id);
    t.is(undefined, sinon.assert.calledOnce(sequelize.Exchange.findOne));
    t.is(undefined, sinon.assert.calledOnce(sequelize.Market.findOne));
    t.is(undefined, sinon.assert.notCalled(createMarketStub));
});

test('getMarketInfo should create a new market', async (t) => {
    const createMarketStub = sandbox.stub(
        MarketService.prototype,
        'createMarket',
    );

    const { marketService } = t.context;

    marketService.sequelize.Exchange.findOne.resolves(
        exchangeFindOneStubResult,
    );

    marketService.sequelize.Market.findOne.resolves(null);

    createMarketStub.resolves(createResult);

    const actualResult = await marketService.getMarketInfo(exchange, symbol);

    t.is(createResult, actualResult.marketId);
    t.is(undefined, sinon.assert.calledOnce(sequelize.Exchange.findOne));
    t.is(undefined, sinon.assert.calledOnce(sequelize.Market.findOne));
    t.is(
        undefined,
        sinon.assert.calledOnceWithExactly(
            createMarketStub,
            exchange,
            exchangeFindOneStubResult.id,
            symbol,
        ),
    );
});

test('createMarket should create a new market', async (t) => {
    const { marketService } = t.context;

    const exchangeApiStub = new ccxt[exchange]();

    marketService.sequelize.Market.create.resolves(marketFindOneStubResult);

    const result = await marketService.createMarket(
        exchange,
        exchangeFindOneStubResult,
        symbol,
    );

    t.is(result, marketFindOneStubResult.id);
    t.is(undefined, sinon.assert.calledOnce(exchangeApiStub.loadMarkets));
    t.is(undefined, sinon.assert.calledOnce(sequelize.Market.create));
});
