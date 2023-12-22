import { faker } from '@faker-js/faker';
import Collector from '#domain-collectors/collectors/BaseCollector.js';

describe('[domain-collectors/collectors]: BaseCollector Tests Suite', () => {
    const context = {};
    const exchange = 'binance';
    const symbol = 'BTC/USDT';
    const marketId = faker.number.int();

    const collectorMeta = {
        intervalStart: 1702384093936,
        intervalEnd: 1702384693936,
        collectorTraceId: '6771447a',
    };

    const fetchOrderBookStubResult = {
        symbol,
        bids: [[faker.number.float()]],
        asks: [[faker.number.float()]],
    };

    beforeEach(() => {
        context.amqpChannelStub = {
            assertQueue: jest.fn(),
        };

        context.amqpClientStub = {
            publish: jest.fn(),
            getChannel: jest.fn().mockReturnValue({
                addSetup: (func) => func(context.amqpChannelStub),
            }),
        };

        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };

        context.collector = new Collector({
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            exchange,
            symbol,
            marketId,
            exchangeAPI: {},
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('start method should call fetch and save data', async () => {
        jest.spyOn(context.collector, 'fetchData').mockResolvedValue(
            fetchOrderBookStubResult,
        );
        jest.spyOn(context.collector, 'saveData').mockResolvedValue();

        await context.collector.start(collectorMeta);

        expect(context.collector.fetchData).toHaveBeenCalledTimes(1);
        expect(context.collector.saveData).toHaveBeenCalledTimes(1);
    });

    test('calls logger on error', async () => {
        jest.spyOn(context.collector, 'fetchData').mockRejectedValue(
            new Error('Test Error'),
        );

        try {
            await context.collector.start(collectorMeta);
            expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        } catch (error) {
            expect(context.collector.fetchData).toHaveBeenCalledTimes(1);
        }
    });

    test('publish method encapsulates amqpClient', async () => {
        await context.collector.publish({}, collectorMeta);

        expect(context.amqpClientStub.publish).toHaveBeenCalledTimes(1);
    });

    test('initAMQPConnection passes setup hook to the amqpClient', async () => {
        await context.collector.initAMQPConnection();

        expect(context.amqpChannelStub.assertQueue).toHaveBeenCalledTimes(1);
    });
});
