// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import CCXTSeeder from '../../../../lib/workers/ccxt-seeder/CCXTSeeder.js';
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
        findOrCreate: sandbox
            .stub(Exchange, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };
    t.context.MarketStub = {
        findOrCreate: sandbox
            .stub(Market, 'findOrCreate')
            .returns([{ id: 1 }, true]),
    };

    t.context.loggerStub = {
        info: sandbox.stub(),
        error: sandbox.stub(),
    };

    t.context.ccxtSeeder = new CCXTSeeder({
        logger: t.context.loggerStub,
        sequelize: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method passes symbols to the loadMarkets method if exchange was created', async (t) => {
    const { ccxtSeeder, ExchangeStub } = t.context;

    const loadMarketsStub = sandbox.stub(ccxtSeeder, 'loadMarkets');

    await ccxtSeeder.execute([
        {
            id: 'binance',
            name: 'Binance',
            symbols: ['BTC/EUR'],
        },
    ]);

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the execute method passes symbols to the loadMarkets method if exchange was found', async (t) => {
    const { ccxtSeeder, ExchangeStub } = t.context;

    ExchangeStub.findOrCreate.returns([{ id: 1 }, false]);
    const loadMarketsStub = sandbox.stub(ccxtSeeder, 'loadMarkets');

    await ccxtSeeder.execute([
        {
            id: 'binance',
            name: 'Binance',
            symbols: ['BTC/EUR'],
        },
    ]);

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the loadMarkets method tries to create a markets if they are not found', async (t) => {
    const { ccxtSeeder, ccxtStub, MarketStub } = t.context;

    await ccxtSeeder.loadMarkets(
        {
            externalExchangeId: 'binance',
            name: 'Binance',
        },
        ['BTC/EUR'],
    );

    sinon.assert.calledOnce(ccxtStub.binance);
    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});

test('the loadMarkets method will not create market if it was found', async (t) => {
    const { ccxtSeeder, ccxtStub, MarketStub } = t.context;

    MarketStub.findOrCreate.returns([{ id: 1 }, false]);
    await ccxtSeeder.loadMarkets(
        {
            externalExchangeId: 'binance',
            name: 'Binance',
        },
        ['BTC/EUR'],
    );

    sinon.assert.calledOnce(ccxtStub.binance);
    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});
