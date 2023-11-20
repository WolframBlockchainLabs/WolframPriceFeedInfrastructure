import Ticker from '../../../../lib/domain-model/entities/market-records/Ticker.js';
import TickerWriter from '../../../../lib/workers/database-writer/TickerWriter.js';

describe('[database-writer]: TickerWriter Tests Suite', () => {
    const context = {};

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

        context.TickerStub = {
            findOrCreate: jest
                .spyOn(Ticker, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.loggerStub = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };

        context.tickerWriter = new TickerWriter({
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
        await context.tickerWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload: {},
        });

        expect(context.TickerStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the execute method ignores incoming data if its already saved', async () => {
        context.TickerStub.findOrCreate.mockResolvedValue([{ id: 1 }, false]);

        await context.tickerWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload: {},
        });

        expect(context.TickerStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
