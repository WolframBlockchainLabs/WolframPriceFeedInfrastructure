import { faker } from '@faker-js/faker';
import CandleStickCollector from '#domain-collectors/collectors/CandleStickCollector.js';

describe('[domain-collectors/collectors]: CandleStickCollector Tests Suite', () => {
    const exchange = 'binance';
    const symbol = 'BTC/USDT';
    const marketId = faker.number.int();

    const collectorMeta = {
        intervalStart: 1702384093936,
        intervalEnd: 1702384693936,
        collectorTraceId: '6771447a',
    };

    const fetchOHLCVStubResult = [
        [faker.number.float(), faker.number.float(), faker.number.float()],
    ];

    const context = {};

    beforeEach(() => {
        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };
        context.exchangeAPIStub = {
            fetchOHLCV: jest.fn().mockResolvedValue(fetchOHLCVStubResult),
            milliseconds: jest.fn().mockResolvedValue(6000),
            timeframes: {
                '1s': '1s',
                '1m': '1m',
            },
        };
        context.candleStickCollector = new CandleStickCollector({
            logger: context.loggerStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: context.exchangeAPIStub,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetch data should return existing candleStick info', async () => {
        const result =
            await context.candleStickCollector.fetchData(collectorMeta);

        expect(result).toEqual(fetchOHLCVStubResult);
        expect(context.exchangeAPIStub.fetchOHLCV).toHaveBeenCalledTimes(1);
    });

    test('save data should call publish method', async () => {
        jest.spyOn(context.candleStickCollector, 'publish').mockImplementation(
            () => {},
        );

        await context.candleStickCollector.saveData(
            fetchOHLCVStubResult,
            collectorMeta,
        );

        expect(context.candleStickCollector.publish).toHaveBeenCalledTimes(1);
    });

    test('calls logger if fetch fails', async () => {
        context.exchangeAPIStub.fetchOHLCV.mockRejectedValue(
            new Error('Test Error'),
        );

        await expect(() =>
            context.candleStickCollector.start(collectorMeta),
        ).rejects.toThrow();
        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
    });

    test('getTimeframe should return seconds-precision timeframe if interval is less than a minute', async () => {
        const result = await context.candleStickCollector.getTimeframe({
            intervalStart: 1702384093936,
            intervalEnd: 1702384095936,
        });

        expect(result).toEqual(CandleStickCollector.TIMEFRAMES.SECOND);
    });

    test('getTimeframe should return minute-precision timeframe if interval is more than a minute', async () => {
        const result = await context.candleStickCollector.getTimeframe({
            intervalStart: 1702384093936,
            intervalEnd: 1702384693936,
        });

        expect(result).toEqual(CandleStickCollector.TIMEFRAMES.MINUTE);
    });

    test('getLimit should return seconds-precision limit', async () => {
        const result = await context.candleStickCollector.getLimit({
            intervalStart: 1702384093936,
            intervalEnd: 1702384095936,
            timeframe: CandleStickCollector.TIMEFRAMES.SECOND,
        });

        expect(result).toEqual(2);
    });

    test('getLimit should return minute-precision limit', async () => {
        const result = await context.candleStickCollector.getLimit({
            intervalStart: 1702384093936,
            intervalEnd: 1702384693936,
            timeframe: CandleStickCollector.TIMEFRAMES.MINUTE,
        });

        expect(result).toEqual(10);
    });
});
