import { MILLISECONDS_IN_A_MINUTE } from '../../../../lib/constants/timeframes.js';
import OrderBook from '../../../../lib/domain-model/entities/market-records/OrderBook.js';
import OrderBookWriter from '../../../../lib/workers/database-writer/OrderBookWriter.js';

describe('[database-writer]: OrderBookWriter Tests Suite', () => {
    const context = {};

    const payload = {
        intervalEnd: 1702287483000,
        intervalStart: 1702287483000 - MILLISECONDS_IN_A_MINUTE,
        marketId: 1,
    };

    beforeEach(() => {
        context.amqpChannelStub = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            addSetup: jest.fn((func) => func(context.amqpChannelStub)),
            ack: jest.fn(),
        };

        context.amqpClientStub = {
            publish: jest.fn(),
            getChannel: jest.fn().mockReturnValue(context.amqpChannelStub),
        };

        context.OrderBookStub = {
            findOrCreate: jest
                .spyOn(OrderBook, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.loggerStub = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };

        context.orderBookWriter = new OrderBookWriter({
            logger: context.loggerStub,
            sequelize: {},
            amqpClient: context.amqpClientStub,
            consumerConfig: {},
            config: {
                retryLimit: 3,
                retryPeriodMs: 3000,
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the execute method saves incoming data if its not already saved', async () => {
        await context.orderBookWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.OrderBookStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the execute method ignores incoming data if its already saved', async () => {
        context.OrderBookStub.findOrCreate.mockResolvedValue([
            { id: 1 },
            false,
        ]);

        await context.orderBookWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.OrderBookStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
