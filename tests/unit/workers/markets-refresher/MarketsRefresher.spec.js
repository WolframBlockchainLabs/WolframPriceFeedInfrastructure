import MarketsRefresher from '../../../../lib/workers/markets-refresher/MarketsRefresher.js';
import Exchange from '../../../../lib/domain-model/entities/Exchange.js';
import Market from '../../../../lib/domain-model/entities/Market.js';

jest.mock('ccxt', () => ({
    binance: jest.fn().mockImplementation(function () {
        return {
            loadMarkets: jest.fn().mockResolvedValue({ 'BTC/EUR': {} }),
        };
    }),
}));

describe('[markets-refresher]: MarketsRefresher Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.ExchangeStub = {
            findOne: jest
                .spyOn(Exchange, 'findOne')
                .mockResolvedValue({ id: 1 }),
        };

        context.marketInstanceStub = {
            update: jest.fn(),
        };
        context.MarketStub = {
            findOne: jest
                .spyOn(Market, 'findOne')
                .mockResolvedValue(context.marketInstanceStub),
        };

        context.loggerStub = {
            info: jest.fn(),
            warning: jest.fn(),
        };

        context.marketsRefresher = new MarketsRefresher({
            logger: context.loggerStub,
            sequelize: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the execute method passes symbols to the refreshMarkets method if exchange was found', async () => {
        const refreshMarketsSpy = jest
            .spyOn(context.marketsRefresher, 'refreshMarkets')
            .mockImplementation(() => Promise.resolve());

        await context.marketsRefresher.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.ExchangeStub.findOne).toHaveBeenCalledTimes(1);
        expect(refreshMarketsSpy).toHaveBeenCalledTimes(1);
    });

    test('the execute method logs a warning if exchange was not found', async () => {
        context.ExchangeStub.findOne.mockResolvedValue(null);
        const refreshMarketsSpy = jest
            .spyOn(context.marketsRefresher, 'refreshMarkets')
            .mockImplementation(() => Promise.resolve());

        await context.marketsRefresher.execute([
            {
                id: 'binance',
                name: 'Binance',
                symbols: ['BTC/EUR'],
            },
        ]);

        expect(context.ExchangeStub.findOne).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.warning).toHaveBeenCalledTimes(1);
        expect(refreshMarketsSpy).not.toHaveBeenCalled();
    });

    test('the refreshMarkets method tries to update a market if it was found', async () => {
        await context.marketsRefresher.refreshMarkets(
            {
                externalExchangeId: 'binance',
                name: 'Binance',
            },
            ['BTC/EUR'],
        );

        expect(context.MarketStub.findOne).toHaveBeenCalledTimes(1);
        expect(context.marketInstanceStub.update).toHaveBeenCalledTimes(1);
    });

    test('the refreshMarkets method logs a warning if market was not found', async () => {
        context.MarketStub.findOne.mockResolvedValue(null);

        await context.marketsRefresher.refreshMarkets(
            {
                externalExchangeId: 'binance',
                name: 'Binance',
            },
            ['BTC/EUR'],
        );

        expect(context.MarketStub.findOne).toHaveBeenCalledTimes(1);
        expect(context.loggerStub.warning).toHaveBeenCalledTimes(1);
        expect(context.marketInstanceStub.update).not.toHaveBeenCalled();
    });
});
