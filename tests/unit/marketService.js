
// eslint-disable-next-line import/no-unresolved
import test               from 'ava';
import sinon              from 'sinon';
import ccxt               from 'ccxt';
import { faker }          from '@faker-js/faker';
import  { MarketService } from '../../lib/collector/marketService.js';

let sandbox;

let sequelize;

let ccxtStub;

const exchange = 'binance';
const symbol = faker.word.noun();
const exchangeFindOneStubResult = { id: faker.number.int() };
// const getMarketInfoStubResult = { marketId: faker.number.int() };
const createResult =  faker.number.int();

test.beforeEach(t => {
    sandbox = sinon.createSandbox();

    sequelize = {
        Exchange : {
            findOne : sinon.stub()
        },
        Market : {
            findOne : sinon.stub(),
            create  : sinon.stub()
        }
    };

    ccxtStub = {
        exchange : sinon.stub().returns({
            loadMarkets : sinon.stub().resolves({
                symbol : {
                    id      : 'externalMarketId',
                    base    : 'base',
                    quote   : 'quote',
                    baseId  : 'baseId',
                    quoteId : 'quoteId',
                    active  : true
                }
            })
        })
    };

    // eslint-disable-next-line no-param-reassign
    t.context.marketService = new MarketService(sequelize);
});

test.afterEach(() => {
    sandbox.restore();
});

test('getMarketInfo should return existing market info', async t => {
    const { marketService } = t.context;
    const createMarketStub = sandbox.stub(MarketService.prototype, 'createMarket');

    marketService.sequelize.Exchange.findOne.resolves({ id: 1 });
    marketService.sequelize.Market.findOne.resolves({ id: 2 });

    const result = await marketService.getMarketInfo(exchange, symbol);

    t.deepEqual(result, { marketId: 2 });
    t.is(undefined, sinon.assert.calledOnce(sequelize.Exchange.findOne));
    t.is(undefined, sinon.assert.calledOnce(sequelize.Market.findOne));
    t.is(undefined, sinon.assert.notCalled(createMarketStub));
});

test('getMarketInfo should create a new market', async t => {
    const createMarketStub = sandbox.stub(MarketService.prototype, 'createMarket');

    const { marketService } = t.context;

    marketService.sequelize.Exchange.findOne.resolves(exchangeFindOneStubResult);

    marketService.sequelize.Market.findOne.resolves(null);

    createMarketStub.resolves(createResult);

    const actualResult = await marketService.getMarketInfo(exchange, symbol);

    t.is(createResult, actualResult.marketId);
    t.is(undefined, sinon.assert.calledOnce(sequelize.Exchange.findOne));
    t.is(undefined, sinon.assert.calledOnce(sequelize.Market.findOne));
    t.is(undefined, sinon.assert.calledOnceWithExactly(
        createMarketStub, exchange,
        exchangeFindOneStubResult.id, symbol
    ));
});

test.only('createMarket should create a new market', async t => {
    const { marketService } = t.context;

    const exchangeApiStub = sandbox.stub(ccxt.prototype, 'exchange').value({ exchange: ccxtStub.exchange });

    marketService.sequelize.Market.create.resolves({ id: 1 });

    const result = await marketService.createMarket('exchange', 1, 'symbol');

    console.log(result);

    t.is(3, 3);
});


// orderBookStub = sandbox.stub(OrderBookCollector.prototype, 'exchangeAPI').value({fetchOrderBook: fetchOrderBookStub;
