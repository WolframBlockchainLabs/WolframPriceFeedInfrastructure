import BaseMarketRepository from '#domain-collectors/infrastructure/repositories/market-repositories/BaseMarketRepository.js';

class TestMarketRepository extends BaseMarketRepository {}

describe('[domain-collectors/repositories/market-repositories]: BaseMarketRepository Tests Suite', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getQueueSize', () => {
        test('should throw not implemented error', async () => {
            await expect(TestMarketRepository.getQueueSize()).rejects.toThrow(
                `[TestMarketRepository]: getQueueSize method is not implemented`,
            );
        });
    });

    describe('getMarketIds', () => {
        test('should throw not implemented error', async () => {
            await expect(TestMarketRepository.getMarketIds()).rejects.toThrow(
                `[TestMarketRepository]: getMarketIds method is not implemented`,
            );
        });
    });

    describe('getMarketContext', () => {
        test('should throw not implemented error', async () => {
            await expect(
                TestMarketRepository.getMarketContext(),
            ).rejects.toThrow(
                `[TestMarketRepository]: getMarketContext method is not implemented`,
            );
        });
    });

    describe('dumpMarket', () => {
        test('should correctly dump market object', () => {
            const market = {
                id: 'market-id',
                taskName: 'market-task',
                externalExchangeId: 'exchange-id',
                symbol: 'BTC/USD',
                pair: 'BTC/USD',
            };
            const dumpedMarket = TestMarketRepository.dumpMarket(market);
            expect(dumpedMarket).toEqual({
                id: 'market-id',
                taskName: 'market-task',
                externalExchangeId: 'exchange-id',
                symbol: 'BTC/USD',
                pair: 'BTC/USD',
            });
        });
    });
});
