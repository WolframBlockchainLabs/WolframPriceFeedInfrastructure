// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import sinon from 'sinon';
import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';
import TezosSeeder from '../../../../lib/workers/tezos-seeder/TezosSeeder.js';

const ethConfig = {
    exchanges: [
        {
            id: 'quipuswap_v2',
            name: 'QuipuSwap_v2',
            markets: [
                {
                    pair: {
                        pool: 'KT1X1nkqJDR1UHwbfpcnME5Z7agJLjUQNguB',
                        in: {
                            address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
                            decimals: 6,
                            symbol: 'ctez',
                            name: 'Ctez',
                        },
                        out: {
                            address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
                            decimals: 18,
                            symbol: 'kUSD',
                            name: 'Kolibri USD',
                        },
                    },
                    symbol: 'ctez/kUSD',
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

    t.context.tezosSeeder = new TezosSeeder({
        logger: t.context.loggerStub,
        sequelize: {},
    });
});

test.afterEach(() => {
    sandbox.restore();
});

test('the execute method passes symbols to the loadMarkets method if exchange was created', async (t) => {
    const { tezosSeeder, ExchangeStub } = t.context;

    const loadMarketsStub = sandbox.stub(tezosSeeder, 'loadMarkets');

    await tezosSeeder.execute(ethConfig);

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the execute method passes symbols to the loadMarkets method if exchange was found', async (t) => {
    const { tezosSeeder, ExchangeStub } = t.context;

    ExchangeStub.findOrCreate.returns([{ id: 1 }, false]);
    const loadMarketsStub = sandbox.stub(tezosSeeder, 'loadMarkets');

    await tezosSeeder.execute(ethConfig);

    sinon.assert.calledOnce(ExchangeStub.findOrCreate);
    sinon.assert.calledOnce(loadMarketsStub);

    t.pass();
});

test('the loadMarkets method tries to create a markets if they are not found', async (t) => {
    const { tezosSeeder, MarketStub } = t.context;

    await tezosSeeder.loadMarkets(
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
    const { tezosSeeder, MarketStub } = t.context;

    MarketStub.findOrCreate.returns([{ id: 1 }, false]);
    await tezosSeeder.loadMarkets(
        {
            externalExchangeId: 'uniswap_v3',
            name: 'Uniswap_v3',
        },
        ethConfig.exchanges[0].markets,
    );

    sinon.assert.calledOnce(MarketStub.findOrCreate);

    t.pass();
});
