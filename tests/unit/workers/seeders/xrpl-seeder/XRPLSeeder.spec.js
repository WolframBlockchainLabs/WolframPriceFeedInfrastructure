import BaseCryptoConfigSeeder from '#workers/seeders/BaseCryptoConfigSeeder.js';
import XRPLSeeder from '#workers/seeders/xrpl/XRPLSeeder.js';

describe('[seeders/xrpl-seeder]: XRPLSeeder Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.loggerStub = { info: jest.fn(), error: jest.fn() };
        context.xrplSeeder = new XRPLSeeder({
            logger: context.loggerStub,
        });

        context.setupExchangeSpy = jest
            .spyOn(BaseCryptoConfigSeeder.prototype, 'setupExchange')
            .mockResolvedValue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('execute method calls setupExchange with correct parameters', async () => {
        const exchange = {
            id: 'xrpl',
            name: 'XRPL Exchange',
        };
        const markets = [
            {
                pair: { in: { name: 'XRP' }, out: { name: 'USD' } },
                symbol: 'XRP/USD',
            },
        ];

        await context.xrplSeeder.execute({ exchange, markets });

        expect(context.setupExchangeSpy).toHaveBeenCalledWith({
            groupName: 'xrpl',
            exchangeConfig: { ...exchange, markets },
        });
    });

    test('execute method handles errors in setupExchange', async () => {
        context.setupExchangeSpy.mockRejectedValue(
            new Error('Failed to set up exchange'),
        );

        const exchange = {
            id: 'xrpl',
            name: 'XRPL Exchange',
        };
        const markets = [
            {
                pair: { in: { name: 'XRP' }, out: { name: 'USD' } },
                symbol: 'XRP/USD',
            },
        ];

        await expect(
            context.xrplSeeder.execute({ exchange, markets }),
        ).rejects.toThrow('Failed to set up exchange');

        expect(context.setupExchangeSpy).toHaveBeenCalled();
    });
});
