import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/BackoffPolicy.js';

describe('[domain-collectors/infrastructure/amqp-policies]: BackoffPolicy Tests Suite', () => {
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
        context.backoffPolicy = new BackoffPolicy({
            amqpClient: context.amqpClientStub,
            rabbitGroupName: 'testGroup',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('BackoffPolicy constructor should initialize with modified rabbitGroupName', () => {
        const amqpClient = {};
        const rabbitGroupName = 'testGroup';

        const instance = new BackoffPolicy({ amqpClient, rabbitGroupName });

        expect(instance.rabbitGroupName).toBe(`${rabbitGroupName}::backoff`);
    });

    test('broadcastRateLimitChange should call broadcast with the correct rateLimitMultiplier', async () => {
        jest.spyOn(context.backoffPolicy, 'broadcast').mockResolvedValue();

        const rateLimitMultiplier = 2;

        await context.backoffPolicy.broadcastRateLimitChange(
            rateLimitMultiplier,
        );

        expect(context.backoffPolicy.broadcast).toHaveBeenCalledTimes(1);
        expect(context.backoffPolicy.broadcast).toHaveBeenCalledWith({
            rateLimitMultiplier,
        });
    });
});
