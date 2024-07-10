import Market from '#domain-model/entities/Market.js';
import BaseCryptoConfigSeeder from '#workers/seeders/BaseCryptoConfigSeeder.js';
import UDEXSeeder from '#workers/seeders/udex/UDEXSeeder.js';

describe('[seeders/udex-seeder]: UDEXSeeder Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.loggerStub = { info: jest.fn(), error: jest.fn() };
        context.udexSeeder = new UDEXSeeder({
            logger: context.loggerStub,
        });

        context.setupExchangeSpy = jest
            .spyOn(BaseCryptoConfigSeeder.prototype, 'setupExchange')
            .mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('execute method calls setupGroup for each groupConfig', async () => {
        const udexCollectorsConfig = {
            group1: {
                groupName: 'Group1',
                exchanges: [
                    { id: 'exchange1', name: 'Exchange 1', markets: [] },
                ],
            },
            group2: {
                groupName: 'Group2',
                exchanges: [
                    { id: 'exchange2', name: 'Exchange 2', markets: [] },
                ],
            },
        };

        const setupGroupSpy = jest
            .spyOn(context.udexSeeder, 'setupGroup')
            .mockResolvedValue();

        await context.udexSeeder.execute(udexCollectorsConfig);

        expect(setupGroupSpy).toHaveBeenCalledTimes(2);
        expect(setupGroupSpy).toHaveBeenCalledWith(udexCollectorsConfig.group1);
        expect(setupGroupSpy).toHaveBeenCalledWith(udexCollectorsConfig.group2);
    });

    test('setupGroup method calls setupExchange for each exchangeConfig', async () => {
        const groupConfig = {
            groupName: 'Group1',
            exchanges: [
                { id: 'exchange1', name: 'Exchange 1', markets: [] },
                { id: 'exchange2', name: 'Exchange 2', markets: [] },
            ],
        };

        await context.udexSeeder.setupGroup(groupConfig);

        expect(context.setupExchangeSpy).toHaveBeenCalledTimes(2);
        expect(context.setupExchangeSpy).toHaveBeenCalledWith({
            groupName: 'Group1',
            exchangeConfig: groupConfig.exchanges[0],
        });
        expect(context.setupExchangeSpy).toHaveBeenCalledWith({
            groupName: 'Group1',
            exchangeConfig: groupConfig.exchanges[1],
        });
    });

    test('setupGroup method logs group setup info', async () => {
        const groupConfig = {
            groupName: 'Group1',
            exchanges: [{ id: 'exchange1', name: 'Exchange 1', markets: [] }],
        };

        await context.udexSeeder.setupGroup(groupConfig);

        expect(context.loggerStub.info).toHaveBeenCalledWith(
            'Setting up [Group1] group',
        );
    });

    test('setupExchange handles errors in setupGroup', async () => {
        context.setupExchangeSpy.mockRejectedValue(
            new Error('Failed to set up exchange'),
        );

        const groupConfig = {
            groupName: 'Group1',
            exchanges: [{ id: 'exchange1', name: 'Exchange 1', markets: [] }],
        };

        await expect(
            context.udexSeeder.setupGroup(groupConfig),
        ).rejects.toThrow('Failed to set up exchange');

        expect(context.setupExchangeSpy).toHaveBeenCalled();
    });

    test('updateOrCreateMarket method is called with correct parameters', async () => {
        const marketUpdateOrCreateSpy = jest
            .spyOn(Market, 'updateOrCreate')
            .mockResolvedValue([{ id: 1, externalMarketId: 'XRP/USD' }, true]);

        const exchange = {
            id: 'xrpl',
            name: 'XRPL Exchange',
        };
        const pair = {
            in: { symbol: 'XRP', meta: {}, name: 'XRP1' },
            out: { symbol: 'USD', meta: {}, name: 'USD1' },
        };
        const symbol = 'XRP/USD';

        await context.udexSeeder.updateOrCreateMarket({
            symbol,
            exchange,
            pair,
        });

        expect(marketUpdateOrCreateSpy).toHaveBeenCalledWith(
            {
                externalMarketId: symbol,
                exchangeId: exchange.id,
            },
            {
                symbol,
                meta: pair.meta,
                active: true,
                base: pair.in.symbol,
                baseId: pair.in.name,
                baseMeta: pair.in.meta,
                quote: pair.out.symbol,
                quoteId: pair.out.name,
                quoteMeta: pair.out.meta,
            },
        );
    });
});
