// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';
import UDEXSeeder from '../../../../lib/workers/udex-seeder/UDEXSeeder.js';

const ethConfig = {
    exchanges: [
        {
            id: 'uniswap_v3',
            name: 'Uniswap_v3',
            markets: [
                {
                    pair: {
                        in: {
                            address:
                                '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                            decimals: 18,
                            symbol: 'WETH',
                            name: 'Wrapped Ether',
                        },
                        out: {
                            address:
                                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                            decimals: 6,
                            symbol: 'USDC',
                            name: 'USD//C',
                        },
                    },
                    symbol: 'WETH/USDC',
                },
            ],
        },
    ],
};

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

    t.context.udexSeeder = new UDEXSeeder({
        logger: t.context.loggerStub,
        sequelize: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method passes symbols to the loadMarkets method if exchange was created', async (t) => {
    const { udexSeeder, ExchangeStub } = t.context;

    const loadMarketsStub = sandbox.stub(udexSeeder, 'loadMarkets');

    await udexSeeder.execute(ethConfig);

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the execute method passes symbols to the loadMarkets method if exchange was found', async (t) => {
    const { udexSeeder, ExchangeStub } = t.context;

    ExchangeStub.findOrCreate.returns([{ id: 1 }, false]);
    const loadMarketsStub = sandbox.stub(udexSeeder, 'loadMarkets');

    await udexSeeder.execute(ethConfig);

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the loadMarkets method tries to create a markets if they are not found', async (t) => {
    const { udexSeeder, MarketStub } = t.context;

    await udexSeeder.loadMarkets(
        {
            externalExchangeId: 'uniswap_v3',
            name: 'Uniswap_v3',
        },
        ethConfig.exchanges[0].markets,
    );

    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});

test('the loadMarkets method will not create market if it was found', async (t) => {
    const { udexSeeder, MarketStub } = t.context;

    MarketStub.findOrCreate.returns([{ id: 1 }, false]);
    await udexSeeder.loadMarkets(
        {
            externalExchangeId: 'uniswap_v3',
            name: 'Uniswap_v3',
        },
        ethConfig.exchanges[0].markets,
    );

    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});
