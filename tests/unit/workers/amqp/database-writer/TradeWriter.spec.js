import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import Trade from '#domain-model/entities/market-records/Trade.js';
import TradeWriter from '#workers/amqp/database-writer/TradeWriter.js';

describe('[database-writer]: TradeWriter Tests Suite', () => {
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

        context.TradeStub = {
            findOrCreate: jest
                .spyOn(Trade, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.loggerStub = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };

        context.tradeWriter = new TradeWriter({
            logger: context.loggerStub,
            sequelize: {},
            amqpClient: context.amqpClientStub,
            consumerConfig: {},
            config: {
                amqpWorker: {
                    retryLimit: 3,
                    retryPeriodMs: 3000,
                },
            },
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the execute method saves incoming data if its not already saved', async () => {
        await context.tradeWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.TradeStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the execute method ignores incoming data if its already saved', async () => {
        context.TradeStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);

        await context.tradeWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.TradeStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
