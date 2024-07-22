import RealtimeCryptoMarketRepository from '#domain-collectors/infrastructure/repositories/market/RealtimeCryptoMarketRepository.js';
import Market from '#domain-model/entities/Market.js';

describe('[domain-collectors/repositories/market-repositories]: RealtimeCryptoMarketRepository Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.externalExchangeId = 'test-exchange-id';
        context.marketId = 'test-market-id';
        context.market = {
            id: context.marketId,
            taskName: 'market-task',
            externalExchangeId: 'exchange-id',
            symbol: 'BTC/USD',
            pair: 'BTC/USD',
            ExchangeEntity: { id: 'exchange-id' },
            BaseToken: { id: 'base-token-id' },
            QuoteToken: { id: 'quote-token-id' },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getQueueSize', () => {
        test('should return count of active members', async () => {
            const countSpy = jest.spyOn(Market, 'scope').mockReturnValue({
                count: jest.fn().mockResolvedValue(10),
            });

            const result = await RealtimeCryptoMarketRepository.getQueueSize(
                context.externalExchangeId,
            );

            expect(countSpy).toHaveBeenCalledWith([
                {
                    method: [
                        'searchActiveByExchange',
                        context.externalExchangeId,
                    ],
                },
            ]);
            expect(result).toBe(10);
        });
    });

    describe('getMarketIds', () => {
        test('should return active market ids', async () => {
            const markets = [{ id: 'market1' }, { id: 'market2' }];
            const findAllSpy = jest.spyOn(Market, 'scope').mockReturnValue({
                findAll: jest.fn().mockResolvedValue(markets),
            });

            const result = await RealtimeCryptoMarketRepository.getMarketIds(
                context.externalExchangeId,
            );

            expect(findAllSpy).toHaveBeenCalledWith([
                {
                    method: [
                        'searchActiveByExchange',
                        context.externalExchangeId,
                    ],
                },
            ]);
            expect(result).toEqual(['market1', 'market2']);
        });
    });
});
