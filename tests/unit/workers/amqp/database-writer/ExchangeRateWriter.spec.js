import { MILLISECONDS_IN_A_MINUTE } from '#constants/timeframes.js';
import ExchangeRate from '#domain-model/entities/market-records/ExchangeRate.js';
import ExchangeRateWriter from '#workers/amqp/database-writer/ExchangeRateWriter.js';

describe('[workers/amqp/database-writer]: ExchangeRateWriter Tests Suite', () => {
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
            sendToQueue: jest.fn(),
            getChannel: jest.fn().mockReturnValue(context.amqpChannelStub),
        };

        context.ExchangeRateStub = {
            findOrCreate: jest
                .spyOn(ExchangeRate, 'findOrCreate')
                .mockResolvedValue([{ id: 1 }, true]),
        };

        context.loggerStub = {
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        };

        context.exchangeRateWriter = new ExchangeRateWriter({
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
        await context.exchangeRateWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.ExchangeRateStub.findOrCreate).toHaveBeenCalledTimes(1);
    });

    test('the execute method ignores incoming data if its already saved', async () => {
        context.ExchangeRateStub.findOrCreate.mockResolvedValue([
            { id: 1 },
            false,
        ]);

        await context.exchangeRateWriter.execute({
            exchange: 'binance',
            symbol: 'BTC/EUR',
            payload,
        });

        expect(context.ExchangeRateStub.findOrCreate).toHaveBeenCalledTimes(1);
    });
});
