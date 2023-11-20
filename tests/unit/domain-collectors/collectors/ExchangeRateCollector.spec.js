import { faker } from '@faker-js/faker';
import ExchangeRateCollector from '../../../../lib/domain-collectors/collectors/ExchangeRateCollector.js';

describe('[domain-collectors/collectors]: ExchangeRateCollector Tests Suite', () => {
    const exchange = 'uniswap_v2';
    const symbol = 'BTC/USDT';
    const marketId = faker.number.int();

    const getExchangeRateStubResult = {
        poolASize: faker.number.float(),
        poolBSize: faker.number.float(),
        exchangeRate: faker.number.float(),
    };

    const context = {};

    beforeEach(() => {
        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };

        context.exchangeAPIStub = {
            getExchangeRate: jest
                .fn()
                .mockResolvedValue(getExchangeRateStubResult),
        };

        context.exchangeRateCollector = new ExchangeRateCollector({
            logger: context.loggerStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: context.exchangeAPIStub,
        });

        context.publishStub = jest
            .spyOn(context.exchangeRateCollector, 'publish')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetch data should return existing orderBook info', async () => {
        const result = await context.exchangeRateCollector.fetchData();
        expect(result).toEqual(getExchangeRateStubResult);
        expect(context.exchangeAPIStub.getExchangeRate).toHaveBeenCalledTimes(
            1,
        );
    });

    test('save data should call publish method', async () => {
        await context.exchangeRateCollector.saveData(getExchangeRateStubResult);

        expect(context.publishStub).toHaveBeenCalledTimes(1);
    });

    test('calls logger if fetch fails', async () => {
        context.exchangeAPIStub.getExchangeRate.mockRejectedValue(
            new Error('Test Error'),
        );

        await expect(() =>
            context.exchangeRateCollector.start(),
        ).rejects.toThrow();
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
    });
});
