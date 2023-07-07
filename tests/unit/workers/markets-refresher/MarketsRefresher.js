// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import MarketsRefresher from '../../../../lib/workers/markets-refresher/MarketsRefresher.js';
import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';
// eslint-disable-next-line import/no-unresolved
import ccxt from 'ccxt';

let sandbox;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

    t.context.ccxtStub = {
        binance: sandbox.stub(ccxt, 'binance').callsFake(function () {
            return {
                loadMarkets: sandbox.stub().returns({
                    'BTC/EUR': {},
                }),
            };
        }),
    };

    t.context.ExchangeStub = {
        findOne: sandbox.stub(Exchange, 'findOne').returns({ id: 1 }),
    };

    t.context.marketInstanceStub = {
        update: sandbox.stub(),
    };
    t.context.MarketStub = {
        findOne: sandbox
            .stub(Market, 'findOne')
            .returns(t.context.marketInstanceStub),
    };

    t.context.loggerStub = {
        info: sandbox.stub(),
        warn: sandbox.stub(),
    };

    t.context.marketsRefresher = new MarketsRefresher({
        logger: t.context.loggerStub,
        sequelize: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method passes symbols to the refreshMarkets method if exchange was found', async (t) => {
    const { marketsRefresher, ExchangeStub } = t.context;

    const refreshMarketsStub = sandbox.stub(marketsRefresher, 'refreshMarkets');

    await marketsRefresher.execute([
        {
            id: 'binance',
            name: 'Binance',
            symbols: ['BTC/EUR'],
        },
    ]);

    sinon.assert.calledOnce(ExchangeStub.findOne);
    sinon.assert.calledOnce(refreshMarketsStub);

    t.pass();
});

test('the execute method logs a warning if exchange was not found', async (t) => {
    const { marketsRefresher, ExchangeStub, loggerStub } = t.context;

    ExchangeStub.findOne.returns(null);
    const refreshMarketsStub = sandbox.stub(marketsRefresher, 'refreshMarkets');

    await marketsRefresher.execute([
        {
            id: 'binance',
            name: 'Binance',
            symbols: ['BTC/EUR'],
        },
    ]);

    sinon.assert.calledOnce(ExchangeStub.findOne);
    sinon.assert.calledOnce(loggerStub.warn);
    sinon.assert.notCalled(refreshMarketsStub);

    t.pass();
});

test('the refreshMarkets method tries to update a market if it was found', async (t) => {
    const { marketsRefresher, MarketStub, ccxtStub, marketInstanceStub } =
        t.context;

    await marketsRefresher.refreshMarkets(
        {
            externalExchangeId: 'binance',
            name: 'Binance',
        },
        ['BTC/EUR'],
    );

    sinon.assert.calledOnce(ccxtStub.binance);
    sinon.assert.calledOnce(MarketStub.findOne);
    sinon.assert.calledOnce(marketInstanceStub.update);

    t.pass();
});

test('the refreshMarkets method logs a warning if market was not found', async (t) => {
    const {
        marketsRefresher,
        MarketStub,
        ccxtStub,
        marketInstanceStub,
        loggerStub,
    } = t.context;

    MarketStub.findOne.returns(null);
    await marketsRefresher.refreshMarkets(
        {
            externalExchangeId: 'binance',
            name: 'Binance',
        },
        ['BTC/EUR'],
    );

    sinon.assert.calledOnce(ccxtStub.binance);
    sinon.assert.calledOnce(MarketStub.findOne);
    sinon.assert.calledOnce(loggerStub.warn);
    sinon.assert.notCalled(marketInstanceStub.update);

    t.pass();
});
