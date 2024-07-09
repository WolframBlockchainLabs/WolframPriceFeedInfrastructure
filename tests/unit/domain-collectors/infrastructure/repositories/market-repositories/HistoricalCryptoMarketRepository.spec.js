import HistoricalCryptoMarketRepository from '#domain-collectors/infrastructure/repositories/market-repositories/HistoricalCryptoMarketRepository.js';
import Market from '#domain-model/entities/Market.js';

describe('[domain-collectors/repositories/market-repositories]: HistoricalCryptoMarketRepository Tests Suite', () => {
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
        test('should return count of historical members', async () => {
            const countSpy = jest.spyOn(Market, 'scope').mockReturnValue({
                count: jest.fn().mockResolvedValue(5),
            });

            const result = await HistoricalCryptoMarketRepository.getQueueSize(
                context.externalExchangeId,
            );

            expect(countSpy).toHaveBeenCalledWith([
                {
                    method: [
                        'searchHistoricalByExchange',
                        context.externalExchangeId,
                    ],
                },
            ]);
            expect(result).toBe(5);
        });
    });

    describe('getMarketIds', () => {
        test('should return historical market ids', async () => {
            const markets = [{ id: 'market1' }, { id: 'market2' }];
            const findAllSpy = jest.spyOn(Market, 'scope').mockReturnValue({
                findAll: jest.fn().mockResolvedValue(markets),
            });

            const result = await HistoricalCryptoMarketRepository.getMarketIds(
                context.externalExchangeId,
            );

            expect(findAllSpy).toHaveBeenCalledWith([
                {
                    method: [
                        'searchHistoricalByExchange',
                        context.externalExchangeId,
                    ],
                },
            ]);
            expect(result).toEqual(['market1', 'market2']);
        });
    });
});
