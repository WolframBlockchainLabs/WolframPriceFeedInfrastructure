import Market from '#domain-model/entities/Market';
import Exchange from '#domain-model/entities/Exchange';
import CryptoMarketRepository from '#domain-collectors/infrastructure/repositories/market/CryptoMarketRepository.js';

describe('[domain-collectors/repositories/market-repositories]: CryptoMarketRepository Tests Suite', () => {
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
            Exchange: { id: 'exchange-id' },
            BaseToken: { id: 'base-token-id' },
            QuoteToken: { id: 'quote-token-id' },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getMarketContext', () => {
        test('should return market context', async () => {
            const findByPkSpy = jest
                .spyOn(Market, 'findByPk')
                .mockResolvedValue(context.market);

            const result = await CryptoMarketRepository.getMarketContext(
                context.marketId,
            );

            expect(findByPkSpy).toHaveBeenCalledWith(context.marketId, {
                include: [Exchange],
            });
            expect(result).toEqual(
                CryptoMarketRepository.dumpMarket(context.market),
            );
        });
    });
});
