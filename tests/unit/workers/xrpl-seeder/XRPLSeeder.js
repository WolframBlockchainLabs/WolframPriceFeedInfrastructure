// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import XRPLSeeder from '../../../../lib/workers/xrpl-seeder/XRPLSeeder.js';
import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';

let sandbox;

test.beforeEach((t) => {
    sandbox = sinon.createSandbox();

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

    t.context.xrplSeeder = new XRPLSeeder({
        logger: t.context.loggerStub,
        sequelize: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method passes symbols to the loadMarkets method if exchange was created', async (t) => {
    const { xrplSeeder, ExchangeStub } = t.context;

    const loadMarketsStub = sandbox.stub(xrplSeeder, 'loadMarkets');

    await xrplSeeder.execute({
        exchange: {
            id: 'xrpl',
            name: 'XRPL',
        },
        markets: [
            {
                pair: {
                    base: {
                        currency: 'XRP',
                    },
                    counter: {
                        currency: 'USD',
                        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    },
                },
                symbol: 'XRP/Bitstamp-USD',
            },
        ],
    });

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the execute method passes symbols to the loadMarkets method if exchange was found', async (t) => {
    const { xrplSeeder, ExchangeStub } = t.context;

    ExchangeStub.findOrCreate.returns([{ id: 1 }, false]);
    const loadMarketsStub = sandbox.stub(xrplSeeder, 'loadMarkets');

    await xrplSeeder.execute({
        exchange: {
            id: 'xrpl',
            name: 'XRPL',
        },
        markets: [
            {
                pair: {
                    base: {
                        currency: 'XRP',
                    },
                    counter: {
                        currency: 'USD',
                        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    },
                },
                symbol: 'XRP/Bitstamp-USD',
            },
        ],
    });

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the loadMarkets method tries to create a markets if they are not found', async (t) => {
    const { xrplSeeder, MarketStub } = t.context;

    await xrplSeeder.loadMarkets(
        {
            externalExchangeId: 'xrpl',
            name: 'XRPL',
        },
        [
            {
                pair: {
                    base: {
                        currency: 'XRP',
                    },
                    counter: {
                        currency: 'USD',
                        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    },
                },
                symbol: 'XRP/Bitstamp-USD',
            },
        ],
    );

    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});

test('the loadMarkets method will not create market if it was found', async (t) => {
    const { xrplSeeder, MarketStub } = t.context;

    MarketStub.findOrCreate.returns([{ id: 1 }, false]);
    await xrplSeeder.loadMarkets(
        {
            externalExchangeId: 'xrpl',
            name: 'XRPL',
        },
        [
            {
                pair: {
                    base: {
                        currency: 'XRP',
                    },
                    counter: {
                        currency: 'USD',
                        issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                    },
                },
                symbol: 'XRP/Bitstamp-USD',
            },
        ],
    );

    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});
