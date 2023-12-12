import PricingEmitter from '../../../../../lib/api/ws-api/emitters/PricingEmitter.js';

describe('[emitters]: PricingEmitter Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.amqpChannelStub = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            addSetup: (func) => func(context.amqpChannelStub),
            ack: jest.fn(),
        };

        context.amqpClientStub = {
            publish: jest.fn(),
            getChannel: jest.fn().mockReturnValue(context.amqpChannelStub),
        };

        context.loggerStub = {
            debug: jest.fn(),
            error: jest.fn(),
        };

        context.io = {
            emit: jest.fn(),
        };

        context.pricingEmitter = new PricingEmitter({
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            io: context.io,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('run calls super.run() method and initAMQPConnection', () => {
        const prototypeRunSpy = jest
            .spyOn(Object.getPrototypeOf(PricingEmitter.prototype), 'run')
            .mockImplementation(() => {});
        const initAMQPConnectionSpy = jest.spyOn(
            context.pricingEmitter,
            'initAMQPConnection',
        );

        context.pricingEmitter.run();

        expect(prototypeRunSpy).toHaveBeenCalledTimes(1);
        expect(initAMQPConnectionSpy).toHaveBeenCalledTimes(1);
    });

    test('initAMQPConnection passes setup hook to the amqpClient', async () => {
        await context.pricingEmitter.initAMQPConnection();

        expect(context.amqpChannelStub.assertQueue).toHaveBeenCalledTimes(1);
        expect(context.amqpChannelStub.consume).toHaveBeenCalledTimes(1);
    });

    test('process emits io messages and acknowledges incoming message to rabbitmq', async () => {
        await context.pricingEmitter.process({
            content: Buffer.from(
                JSON.stringify({
                    exchange: 'binance',
                    symbol: 'BTC/USDT',
                    payload: {
                        intervalStart: 1702384093936,
                        intervalEnd: 1702384693936,
                    },
                    type: 'Trades',
                }),
            ),
        });

        expect(context.io.emit).toHaveBeenCalledTimes(1);
        expect(context.amqpChannelStub.ack).toHaveBeenCalledTimes(1);
    });
});
