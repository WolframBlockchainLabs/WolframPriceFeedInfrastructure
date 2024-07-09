import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory';
import BaseAMQPPolicy from '#domain-collectors/infrastructure/amqp-policies/BaseAMQPPolicy.js';

describe('[domain-collectors/infrastructure/amqp-policies]: BaseAMQPPolicy Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.channelStub = {
            addSetup: jest
                .fn()
                .mockImplementation((cb) => cb(context.channelStub)),
            assertExchange: jest.fn().mockResolvedValue(),
            assertQueue: jest.fn().mockResolvedValue({ queue: 'testQueue' }),
            bindQueue: jest.fn().mockResolvedValue(),
            consume: jest.fn().mockResolvedValue({}),
            publish: jest.fn().mockResolvedValue(),
            cancel: jest.fn().mockResolvedValue(),
            unbindQueue: jest.fn().mockResolvedValue(),
            deleteQueue: jest.fn().mockResolvedValue(),
            prefetch: jest.fn().mockResolvedValue(),
        };

        context.getChannel = jest.fn().mockReturnValue(context.channelStub);

        class AMQPClient {
            initConnection = jest.fn();
            getChannel = context.getChannel;
            closeConnection = jest.fn();
        }

        context.amqpClientFactoryStub = new GenericClassFactory({
            Class: AMQPClient,
            defaultOptions: 'this.config.rabbitmq',
        });

        context.baseAMQPPolicy = new BaseAMQPPolicy({
            amqpClientFactory: context.amqpClientFactoryStub,
            rabbitGroupName: 'testGroup',
            policiesConfigs: {
                retryConfig: {
                    retryLimit: 3,
                    retryPeriodMs: 1000,
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('the "start" method passes configureRabbitMQChannel into amqp addSetup', async () => {
        jest.spyOn(
            context.baseAMQPPolicy,
            'configureRabbitMQChannel',
        ).mockImplementation(() => {
            context.baseAMQPPolicy.resolveConfigureChannelPromise();
        });

        await context.baseAMQPPolicy.start();

        expect(context.getChannel).toHaveBeenCalledTimes(1);
        expect(context.channelStub.addSetup).toHaveBeenCalledTimes(1);
        expect(
            context.baseAMQPPolicy.configureRabbitMQChannel,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "configureRabbitMQChannel" should call assertExchange, assertAndBindQueue, and setupConsumer', async () => {
        context.baseAMQPPolicy.resolveConfigureChannelPromise = jest.fn();

        await context.baseAMQPPolicy.configureRabbitMQChannel(
            context.channelStub,
        );

        expect(context.channelStub.assertExchange).toHaveBeenCalledWith(
            'testGroup::BaseAMQPPolicy',
            'fanout',
            { durable: false },
        );
        expect(context.channelStub.assertQueue).toHaveBeenCalledTimes(2);
        expect(context.channelStub.prefetch).toHaveBeenCalledTimes(1);
        expect(context.channelStub.prefetch).toHaveBeenCalledWith(0);
        expect(context.channelStub.bindQueue).toHaveBeenCalledTimes(1);
        expect(context.channelStub.consume).toHaveBeenCalledTimes(1);
        expect(
            context.baseAMQPPolicy.resolveConfigureChannelPromise,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "broadcast" should publish a message to the channel', async () => {
        const rateLimitMultiplier = 2;
        await context.baseAMQPPolicy.broadcast({ rateLimitMultiplier });

        const expectedMessage = Buffer.from(
            JSON.stringify({ rateLimitMultiplier }),
        );
        expect(context.channelStub.publish).toHaveBeenCalledWith(
            'testGroup::BaseAMQPPolicy',
            '',
            expectedMessage,
        );
    });

    test('consumer should be implemented by extending classes and throw an error if not', async () => {
        const mockMessage = { content: 'test message' };

        expect(() =>
            context.baseAMQPPolicy.consumer(mockMessage),
        ).rejects.toThrow();
    });

    test('getPrivateQueueAddress should return the rabbitQueueId', () => {
        context.baseAMQPPolicy.rabbitQueueId = 'testQueueId';
        const result = context.baseAMQPPolicy.getPrivateQueueAddress();
        expect(result).toBe('testQueueId');
    });

    test('getMessageObject should return object from amqp message data', () => {
        const data = { test: 1 };

        const result = context.baseAMQPPolicy.getMessageObject({
            content: JSON.stringify(data),
        });

        expect(result).toEqual(data);
    });

    test('getMessageObject should return empty object if message is null', () => {
        const result = context.baseAMQPPolicy.getMessageObject(null);

        expect(result).toEqual({});
    });

    test('stop method should cancel consumer and unbind and delete queue when both consumerTag and rabbitQueueId are set', async () => {
        context.baseAMQPPolicy.consumerTag = 'testConsumerTag';

        await context.baseAMQPPolicy.stop();

        expect(context.channelStub.cancel).toHaveBeenCalledWith(
            'testConsumerTag',
        );
    });

    test('stop method should not cancel consumer and unbind and delete queue when consumerTag and rabbitQueueId are not set', async () => {
        await context.baseAMQPPolicy.stop();

        expect(context.getChannel).toHaveBeenCalledTimes(1);
        expect(context.channelStub.cancel).not.toHaveBeenCalled();
        expect(context.channelStub.unbindQueue).not.toHaveBeenCalled();
        expect(context.channelStub.deleteQueue).not.toHaveBeenCalled();
    });
});
