import GenericClassFactory from '#domain-collectors/infrastructure/GenericClassFactory';
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

        class AMQPClient {
            getChannel = jest.fn().mockReturnValue(context.channelStub);
        }

        context.amqpClientFactoryStub = new GenericClassFactory({
            Class: AMQPClient,
            defaultOptions: 'this.config.rabbitmq',
        });

        context.amqpManagementTargetStub = {
            getStatusHandler: jest.fn(),
            reloadHandler: jest.fn(),
        };

        context.backoffPolicy = new BackoffPolicy({
            amqpClientFactory: context.amqpClientFactoryStub,
            rabbitGroupName: 'testGroup',
            amqpManagementTarget: context.amqpManagementTargetStub,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('BackoffPolicy constructor should initialize with modified rabbitGroupName', () => {
        const rabbitGroupName = 'testGroup';

        const instance = new BackoffPolicy({
            amqpClientFactory: context.amqpClientFactoryStub,
            rabbitGroupName,
        });

        expect(instance.rabbitGroupName).toBe(`${rabbitGroupName}::backoff`);
        expect(instance.prefetchCount).toBe(1);
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

    test('"consumer" should not call reloadHandler if rateLimitMultiplier is less than or equal to getStatusHandler rateLimitMultiplier', async () => {
        context.backoffPolicy.getMessageObject = jest
            .fn()
            .mockReturnValue({ rateLimitMultiplier: 5 });
        context.backoffPolicy.amqpManagementTarget.getStatusHandler.mockReturnValue(
            { rateLimitMultiplier: 10 },
        );

        await context.backoffPolicy.consumer({});

        expect(
            context.backoffPolicy.amqpManagementTarget.reloadHandler,
        ).not.toHaveBeenCalled();
    });

    test('"consumer" should call reloadHandler with correct parameters if rateLimitMultiplier is greater', async () => {
        context.backoffPolicy.getMessageObject = jest
            .fn()
            .mockReturnValue({ rateLimitMultiplier: 15 });
        context.backoffPolicy.amqpManagementTarget.getStatusHandler.mockReturnValue(
            { rateLimitMultiplier: 10 },
        );

        await context.backoffPolicy.consumer({});

        expect(
            context.backoffPolicy.amqpManagementTarget.reloadHandler,
        ).toHaveBeenCalledWith({
            rateLimitMultiplier: 15,
            shouldSleep: true,
        });
    });
});
