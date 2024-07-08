import Exchange from '#domain-model/entities/Exchange.js';
import Market from '#domain-model/entities/Market.js';
import UDEXSeeder from '#workers/seeders/udex/UDEXSeeder.js';

jest.mock('#domain-model/entities/Exchange.js');
jest.mock('#domain-model/entities/Market.js');

describe('[udex-seeder]: UDEXSeeder Tests Suite', () => {
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
    const udexCollectorsConfig = {
        [groupName]: { groupName, exchanges: [exchangeConfig] },
    };
    const context = {};

    beforeEach(() => {
        context.loggerStub = { info: jest.fn(), error: jest.fn() };
        context.udexSeeder = new UDEXSeeder({ logger: context.loggerStub });

        Exchange.findOrCreate.mockResolvedValue([
            { id: 1, name: 'Uniswap_v3' },
            true,
        ]);
        Market.findOrCreate.mockResolvedValue([
            { id: 1, symbol: 'WETH/USDC' },
            true,
        ]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('execute method processes group configurations', async () => {
        await context.udexSeeder.execute(udexCollectorsConfig);

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(`Setting up [${groupName}] group`),
        );
        expect(Exchange.findOrCreate).toHaveBeenCalledWith(expect.any(Object));
        expect(Market.findOrCreate).toHaveBeenCalledWith(expect.any(Object));
    });

    test('setupExchange method handles exchange creation', async () => {
        const setupMarketsSpy = jest
            .spyOn(context.udexSeeder, 'setupMarkets')
            .mockResolvedValue();

        await context.udexSeeder.setupExchange({ groupName, exchangeConfig });

        expect(setupMarketsSpy).toHaveBeenCalled();
    });

    test('setupExchange method handles exchange creation errors', async () => {
        Exchange.findOrCreate.mockRejectedValue(
            new Error('Failed to create exchange'),
        );

        await context.udexSeeder.setupExchange({ groupName, exchangeConfig });

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining(
                `Error setting up exchange [${groupName}/${exchangeConfig.name}]`,
            ),
        );
    });

    test('createMarket method handles market creation errors', async () => {
        Market.findOrCreate.mockRejectedValue(
            new Error('Failed to create market'),
        );

        await context.udexSeeder.createMarket({
            groupName,
            exchange: { id: 1, name: 'Uniswap_v3' },
            marketConfig: exchangeConfig.markets[0],
        });

        expect(context.loggerStub.error).toHaveBeenCalledWith(
            expect.stringContaining(
                `Error creating market [${groupName}/Uniswap_v3 :: WETH/USDC]`,
            ),
        );
    });

    test('setupGroup method processes each exchange configuration within a group', async () => {
        const setupExchangeSpy = jest
            .spyOn(context.udexSeeder, 'setupExchange')
            .mockResolvedValue();

        await context.udexSeeder.setupGroup(udexCollectorsConfig[groupName]);

        expect(setupExchangeSpy).toHaveBeenCalledWith({
            groupName: groupName,
            exchangeConfig: exchangeConfig,
        });
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(`Setting up [${groupName}] group`),
        );
    });

    test('setupMarkets method processes each market configuration', async () => {
        const exchange = { id: 1, name: 'Uniswap_v3' };
        const createMarketSpy = jest
            .spyOn(context.udexSeeder, 'createMarket')
            .mockResolvedValue();

        await context.udexSeeder.setupMarkets({
            groupName,
            exchange,
            markets: exchangeConfig.markets,
        });

        expect(createMarketSpy).toHaveBeenCalledWith({
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

    test('setupExchange method logs correctly when exchange is found', async () => {
        Exchange.findOrCreate.mockResolvedValue([
            { id: 1, name: 'Uniswap_v3' },
            false,
        ]);

        await context.udexSeeder.setupExchange({ groupName, exchangeConfig });

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `Setting up [${groupName}/${exchangeConfig.name}] exchange`,
            ),
        );
        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `${groupName}/Uniswap_v3 exchange has been found successfully`,
            ),
        );
    });

    test('createMarket method logs correctly when market is found', async () => {
        Market.findOrCreate.mockResolvedValue([
            { id: 1, symbol: 'WETH/USDC' },
            false,
        ]);

        await context.udexSeeder.createMarket({
            groupName,
            exchange: { id: 1, name: 'Uniswap_v3' },
            marketConfig: exchangeConfig.markets[0],
        });

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            expect.stringContaining(
                `Market for [${groupName}/Uniswap_v3 :: WETH/USDC] has been found successfully`,
            ),
        );
    });
});
