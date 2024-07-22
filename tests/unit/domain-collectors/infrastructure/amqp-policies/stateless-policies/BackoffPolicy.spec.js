import { MARKET_EVENTS_DICT } from '#constants/collectors/market-events.js';
import GenericClassFactory from '#domain-collectors/utils/GenericClassFactory';
import BackoffPolicy from '#domain-collectors/infrastructure/amqp-policies/stateless-policies/BackoffPolicy.js';

describe('[domain-collectors/infrastructure/amqp-policies/stateless-policies]: BackoffPolicy Tests Suite', () => {
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

        context.mockInternalScheduler = {
            getRateLimitMultiplier: jest.fn(),
        };

        context.mockMarketsManager = {
            getInternalScheduler: jest
                .fn()
                .mockReturnValue(context.mockInternalScheduler),
            reloadActive: jest.fn(),
        };

        context.marketEventManagerStub = {
            emitAsync: jest.fn(),
        };

        context.backoffPolicy = new BackoffPolicy({
            amqpClientFactory: context.amqpClientFactoryStub,
            rabbitGroupName: 'testGroup',
            marketsManager: context.mockMarketsManager,
            marketEventManager: context.marketEventManagerStub,
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
        jest.restoreAllMocks();
    });

    test('BackoffPolicy constructor should initialize with modified rabbitGroupName', () => {
        const rabbitGroupName = 'testGroup';

        const instance = new BackoffPolicy({
            amqpClientFactory: context.amqpClientFactoryStub,
            rabbitGroupName,
            policiesConfigs: {
                retryConfig: {
                    retryLimit: 3,
                    retryPeriodMs: 1000,
                },
            },
        });

        expect(instance.rabbitGroupName).toBe(
            `${BackoffPolicy.AMQP_NETWORK_PREFIX}::${rabbitGroupName}::BackoffPolicy`,
        );
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

    test('"process" should not call reloadActive if rateLimitMultiplier is less than or equal to getStatusHandler rateLimitMultiplier', async () => {
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            10,
        );

        await context.backoffPolicy.process({ rateLimitMultiplier: 5 });

        expect(
            context.backoffPolicy.marketsManager.reloadActive,
        ).not.toHaveBeenCalled();
        expect(
            context.marketEventManagerStub.emitAsync,
        ).not.toHaveBeenCalledWith(MARKET_EVENTS_DICT.RELOAD_CLUSTER);
    });

    test('"process" should call reloadActive with correct parameters if rateLimitMultiplier is greater', async () => {
        context.mockInternalScheduler.getRateLimitMultiplier.mockReturnValue(
            10,
        );

        await context.backoffPolicy.process({ rateLimitMultiplier: 15 });

        expect(
            context.backoffPolicy.marketsManager.reloadActive,
        ).toHaveBeenCalledWith({
            rateLimitMultiplier: 15,
            shouldSleep: true,
        });
        expect(context.marketEventManagerStub.emitAsync).toHaveBeenCalledWith(
            MARKET_EVENTS_DICT.RELOAD_CLUSTER,
        );
    });
});
