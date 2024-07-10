import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import BaseCryptoConfigSeeder from '#workers/seeders/BaseCryptoConfigSeeder.js';

jest.mock('#domain-model/entities/Exchange.js');
jest.mock('#domain-model/entities/Market.js');

describe('[seeders/base-crypto-seeder]: BaseCryptoConfigSeeder Tests Suite', () => {
    const groupName = 'EthGroup';
    const exchangeConfig = {
        id: 'uniswap_v3',
        name: 'Uniswap_v3',
        markets: [
            {
                pair: { in: { name: 'WETH' }, out: { name: 'USDC' } },
                symbol: 'WETH/USDC',
            },
        ],
    };
    const context = {};

    beforeEach(() => {
        context.loggerStub = { info: jest.fn(), error: jest.fn() };
        context.baseCryptoConfigSeeder = new BaseCryptoConfigSeeder({
            logger: context.loggerStub,
        });

        Exchange.updateOrCreate.mockResolvedValue([
            { id: 1, name: 'Uniswap_v3' },
            true,
        ]);
        Market.updateOrCreate.mockResolvedValue([
            { id: 1, symbol: 'WETH/USDC' },
            true,
        ]);
        Market.update.mockResolvedValue([1]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('setupExchange method handles exchange creation', async () => {
        const setupMarketsSpy = jest
            .spyOn(context.baseCryptoConfigSeeder, 'setupMarkets')
            .mockResolvedValue();

        await context.baseCryptoConfigSeeder.setupExchange({
            groupName,
            exchangeConfig,
        });

        expect(setupMarketsSpy).toHaveBeenCalled();
    });

    test('setupExchange method handles exchange creation errors', async () => {
        Exchange.updateOrCreate.mockRejectedValue(
            new Error('Failed to create exchange'),
        );

        await context.baseCryptoConfigSeeder.setupExchange({
            groupName,
            exchangeConfig,
        });

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: `Error setting up exchange [${groupName}/${exchangeConfig.name}]`,
            }),
        );
    });

    test('setupMarkets method processes each market configuration', async () => {
        const exchange = { id: 1, name: 'Uniswap_v3' };
        const seedMarketSpy = jest
            .spyOn(context.baseCryptoConfigSeeder, 'seedMarket')
            .mockResolvedValue();

        await context.baseCryptoConfigSeeder.setupMarkets({
            groupName,
            exchange,
            markets: exchangeConfig.markets,
        });

        expect(seedMarketSpy).toHaveBeenCalledWith({
            groupName,
            exchange,
            marketConfig: exchangeConfig.markets[0],
        });
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `Loading Markets for [${groupName}/${exchange.name}]`,
            ),
        );
    });

    test('setupMarkets method resets market statuses', async () => {
        const exchange = { id: 1, name: 'Uniswap_v3' };
        const resetMarketStatusesSpy = jest
            .spyOn(context.baseCryptoConfigSeeder, 'resetMarketStatuses')
            .mockResolvedValue();

        await context.baseCryptoConfigSeeder.setupMarkets({
            groupName,
            exchange,
            markets: exchangeConfig.markets,
        });

        expect(resetMarketStatusesSpy).toHaveBeenCalledWith(exchange);
    });

    test('setupExchange method logs correctly when exchange is found', async () => {
        Exchange.updateOrCreate.mockResolvedValue([
            { id: 1, name: 'Uniswap_v3' },
            false,
        ]);

        await context.baseCryptoConfigSeeder.setupExchange({
            groupName,
            exchangeConfig,
        });

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `Setting up [${groupName}/${exchangeConfig.name}] exchange`,
            ),
        );
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `${groupName}/Uniswap_v3 exchange has been updated successfully`,
            ),
        );
    });

    test('seedMarket method handles market creation errors', async () => {
        context.baseCryptoConfigSeeder.updateOrCreateMarket = jest
            .fn()
            .mockRejectedValue(new Error('Failed to create market'));

        await context.baseCryptoConfigSeeder.seedMarket({
            groupName,
            exchange: { id: 1, name: 'Uniswap_v3' },
            marketConfig: exchangeConfig.markets[0],
        });

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.objectContaining({
                message: `Error creating market [${groupName}/${exchangeConfig.name} :: WETH/USDC]`,
            }),
        );
    });

    test('seedMarket method logs when market is found', async () => {
        context.baseCryptoConfigSeeder.updateOrCreateMarket = jest
            .fn()
            .mockResolvedValue([
                { id: 1, externalMarketId: 'WETH/USDC' },
                false,
            ]);

        await context.baseCryptoConfigSeeder.seedMarket({
            groupName,
            exchange: { id: 1, name: 'Uniswap_v3' },
            marketConfig: exchangeConfig.markets[0],
        });

        expect(
            context.baseCryptoConfigSeeder.updateOrCreateMarket,
        ).toHaveBeenCalled();
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `Market for [${groupName}/Uniswap_v3 :: WETH/USDC] has been updated successfully`,
            ),
        );
    });

    test('seedMarket method logs when market is created', async () => {
        context.baseCryptoConfigSeeder.updateOrCreateMarket = jest
            .fn()
            .mockResolvedValue([
                { id: 1, externalMarketId: 'WETH/USDC' },
                true,
            ]);

        await context.baseCryptoConfigSeeder.seedMarket({
            groupName,
            exchange: { id: 1, name: 'Uniswap_v3' },
            marketConfig: exchangeConfig.markets[0],
        });

        expect(
            context.baseCryptoConfigSeeder.updateOrCreateMarket,
        ).toHaveBeenCalled();
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `Market for [${groupName}/Uniswap_v3 :: WETH/USDC] has been created successfully`,
            ),
        );
    });

    test('updateOrCreateMarket method is called with correct parameters', async () => {
        const updateOrCreateMarketSpy = jest.spyOn(
            context.baseCryptoConfigSeeder,
            'updateOrCreateMarket',
        );

        await context.baseCryptoConfigSeeder.seedMarket({
            groupName,
            exchange: { id: 1, name: 'Uniswap_v3' },
            marketConfig: exchangeConfig.markets[0],
        });

        expect(updateOrCreateMarketSpy).toHaveBeenCalledWith({
            symbol: 'WETH/USDC',
            exchange: { id: 1, name: 'Uniswap_v3' },
            pair: { in: { name: 'WETH' }, out: { name: 'USDC' } },
        });
    });
});
