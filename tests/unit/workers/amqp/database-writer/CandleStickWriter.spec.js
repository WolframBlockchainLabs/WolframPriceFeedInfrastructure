import CandleStick from '#domain-model/entities/market-records/CandleStick.js';
import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import CandleStickWriter from '#workers/amqp/database-writer/CandleStickWriter.js';

describe('[database-writer]: CandleStickWriter Tests Suite', () => {
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

        context.CandleStickStub = {
            findOrCreate: jest
                .spyOn(CandleStick, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.loggerStub = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };

        context.candleStickWriter = new CandleStickWriter({
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
        await context.candleStickWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.CandleStickStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the execute method ignores incoming data if its already saved', async () => {
        context.CandleStickStub.findOrCreate.mockResolvedValue([
            { id: 1 },
            false,
        ]);

        await context.candleStickWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.CandleStickStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
