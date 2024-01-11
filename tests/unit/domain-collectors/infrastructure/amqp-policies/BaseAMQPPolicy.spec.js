import BaseAMQPPolicy from '#domain-collectors/infrastructure/amqp-policies/BaseAMQPPolicy.js';

describe('[domain-collectors/infrastructure/amqp-policies]: BaseAMQPPolicy Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.channelStub = {
            addSetup: jest.fn().mockImplementation((cb) => cb()),
            assertExchange: jest.fn().mockResolvedValue(),
            assertQueue: jest.fn().mockResolvedValue({ queue: 'testQueue' }),
            bindQueue: jest.fn().mockResolvedValue(),
            consume: jest.fn().mockResolvedValue(),
            publish: jest.fn().mockResolvedValue(),
        };

        context.amqpClientStub = {
            getChannel: jest.fn().mockReturnValue(context.channelStub),
        };

        context.baseAMQPPolicy = new BaseAMQPPolicy({
            amqpClient: context.amqpClientStub,
            rabbitGroupName: 'testGroup',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('the "start" method passes configureRabbitMQChannel into amqp addSetup', async () => {
        jest.spyOn(
            context.baseAMQPPolicy,
            'configureRabbitMQChannel',
        ).mockImplementation(() => {});

        await context.baseAMQPPolicy.start();

        expect(context.amqpClientStub.getChannel).toHaveBeenCalledTimes(1);
        expect(context.channelStub.addSetup).toHaveBeenCalledTimes(1);
        expect(
            context.baseAMQPPolicy.configureRabbitMQChannel,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "configureRabbitMQChannel" should call assertExchange, assertAndBindQueue, and setupConsumer', async () => {
        await context.baseAMQPPolicy.configureRabbitMQChannel(
            context.channelStub,
        );

        expect(context.channelStub.assertExchange).toHaveBeenCalledWith(
            'testGroup',
            'fanout',
            { durable: false },
        );
        expect(context.channelStub.assertQueue).toHaveBeenCalledTimes(1);
        expect(context.channelStub.bindQueue).toHaveBeenCalledTimes(1);
        expect(context.channelStub.consume).toHaveBeenCalledTimes(1);
    });

    test('the "broadcast" should publish a message to the channel', async () => {
        const rateLimitMultiplier = 2;
        await context.baseAMQPPolicy.broadcast({ rateLimitMultiplier });

        const expectedMessage = Buffer.from(
            JSON.stringify({ rateLimitMultiplier }),
        );
        expect(context.channelStub.publish).toHaveBeenCalledWith(
            'testGroup',
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
});
