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

    test('the "start" method should set reloadHandler and call setupReplicaChannel', async () => {
        jest.spyOn(
            context.baseAMQPPolicy,
            'setupReplicaChannel',
        ).mockResolvedValue();

        await context.baseAMQPPolicy.start(() => {});

        expect(
            context.baseAMQPPolicy.setupReplicaChannel,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "setupReplicaChannel" method passes configureRabbitMQChannel into amqp addSetup', async () => {
        jest.spyOn(
            context.baseAMQPPolicy,
            'configureRabbitMQChannel',
        ).mockImplementation(() => {});

        await context.baseAMQPPolicy.setupReplicaChannel();

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

    test('consumer should call the handler with the provided message', async () => {
        const mockHandler = jest.fn().mockResolvedValue();
        context.baseAMQPPolicy.handler = mockHandler;

        const mockMessage = { content: 'test message' };
        await context.baseAMQPPolicy.consumer(mockMessage);

        expect(mockHandler).toHaveBeenCalledTimes(1);
        expect(mockHandler).toHaveBeenCalledWith(mockMessage);
    });

    test('getPrivateQueueAddress should return the rabbitQueueId', () => {
        context.baseAMQPPolicy.rabbitQueueId = 'testQueueId';
        const result = context.baseAMQPPolicy.getPrivateQueueAddress();
        expect(result).toBe('testQueueId');
    });
});
