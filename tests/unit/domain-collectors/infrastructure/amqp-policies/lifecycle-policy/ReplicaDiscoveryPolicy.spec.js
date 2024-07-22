import GenericClassFactory from '#domain-collectors/utils/GenericClassFactory';
import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/lifecycle-policy/ReplicaDiscoveryPolicy.js';
import { Mutex } from 'async-mutex';

describe('[domain-collectors/infrastructure/amqp-policies/lifecycle-policy]: ReplicaDiscoveryPolicy Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.rabbitGroupName = 'testGroup';
        context.replicaDiscoveryConfig = {
            initializationDelay: 200,
            statusDebounceDelay: 100,
            shareDebounceDelay: 100,
            closeDebounceDelay: 150,
            phaseReleaseDelay: 1000,
            discoveryInterval: 5000,
        };
        context.StateManagers = [];

        context.amqpChannelStub = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            addSetup: jest.fn((func) => func(context.amqpChannelStub)),
            ack: jest.fn(),
        };

        context.sendToQueueStub = jest.fn().mockResolvedValue();

        class AMQPClient {
            initConnection = jest.fn();
            sendToQueue = context.sendToQueueStub;
            getChannel = jest.fn().mockReturnValue(context.amqpChannelStub);
        }

        context.amqpClientFactoryStub = new GenericClassFactory({
            Class: AMQPClient,
            defaultOptions: 'this.config.rabbitmq',
        });

        context.marketsManager = {
            start: jest.fn(),
            stop: jest.fn(),
            reloadActive: jest.fn(),
            getIdentity: jest.fn().mockReturnValue('mock-identity'),
        };

        context.stateManager = {
            getCurrentState: jest.fn(),
            aggregateCloseState: jest.fn(),
            sanitizeShareState: jest.fn(),
            aggregateShareState: jest.fn(),
            shouldReload: jest.fn(),
            updateState: jest.fn(),
            normalizeState: jest.fn(),
            aggregateState: jest.fn(),
        };

        context.stateManagerFactory = {
            create: jest.fn().mockReturnValue(context.stateManager),
        };

        context.replicaDiscoveryPolicy = new ReplicaDiscoveryPolicy({
            rabbitGroupName: context.rabbitGroupName,
            amqpClientFactory: context.amqpClientFactoryStub,
            marketsManager: context.marketsManager,
            policiesConfigs: {
                retryConfig: {
                    retryLimit: 3,
                    retryPeriodMs: 1000,
                },
                replicaDiscovery: context.replicaDiscoveryConfig,
            },
            stateManagerFactory: context.stateManagerFactory,
        });

        context.replicaDiscoveryPolicy.initStateManager();

        context.replicaDiscoveryPolicy.interPhaseMutex = {
            acquire: jest.fn(),
            release: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    test('start method initializes and schedules tasks', async () => {
        const superSTartSpy = jest
            .spyOn(
                Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype),
                'start',
            )
            .mockImplementation(() => {});

        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'initPolicy',
        ).mockImplementation(() => {});
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'scheduleResyncTask',
        ).mockImplementation(() => {});

        context.replicaDiscoveryPolicy.initConfig(
            context.replicaDiscoveryConfig,
        );

        await context.replicaDiscoveryPolicy.start();

        expect(superSTartSpy).toHaveBeenCalled();
        expect(context.replicaDiscoveryPolicy.initPolicy).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.scheduleResyncTask,
        ).toHaveBeenCalledWith(
            context.replicaDiscoveryConfig.discoveryInterval,
        );
    });

    test('stop method clears interval and performs necessary cleanups', async () => {
        jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
        jest.spyOn(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype),
            'stop',
        ).mockResolvedValue();

        await context.replicaDiscoveryPolicy.stop();

        expect(clearInterval).toHaveBeenCalledWith(
            context.replicaDiscoveryPolicy.resyncInterval,
        );
        expect(
            context.replicaDiscoveryPolicy.marketsManager.stop,
        ).toHaveBeenCalled();
        expect(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype).stop,
        ).toHaveBeenCalled();
    });

    test('stop method clears interval and performs necessary cleanups', async () => {
        jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
        jest.spyOn(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype),
            'stop',
        ).mockResolvedValue();

        await context.replicaDiscoveryPolicy.stop();

        expect(clearInterval).toHaveBeenCalledWith(
            context.replicaDiscoveryPolicy.resyncInterval,
        );
        expect(
            context.replicaDiscoveryPolicy.marketsManager.stop,
        ).toHaveBeenCalled();
        expect(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype).stop,
        ).toHaveBeenCalled();
    });

    test('handleChannelTeardown method should broadcast CLOSE message', async () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcastClose',
        ).mockImplementation(() => {});
        jest.spyOn(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype),
            'handleChannelTeardown',
        ).mockResolvedValue();

        await context.replicaDiscoveryPolicy.handleChannelTeardown();

        expect(
            context.replicaDiscoveryPolicy.broadcastClose,
        ).toHaveBeenCalled();
        expect(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype)
                .handleChannelTeardown,
        ).toHaveBeenCalled();
    });

    describe('ReplicaDiscoveryPolicy Consumer Method', () => {
        test('calls handleHelloMessage for HELLO message type', async () => {
            context.replicaDiscoveryPolicy.handleHelloMessage = jest.fn();

            await context.replicaDiscoveryPolicy.process({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
                data: {},
                from: {},
            });

            expect(
                context.replicaDiscoveryPolicy.handleHelloMessage,
            ).toHaveBeenCalledWith(expect.any(Object));
        });

        test('calls statusMessageBuffer for STATUS message type', async () => {
            jest.spyOn(
                context.replicaDiscoveryPolicy.statusMessageBuffer,
                'addMessage',
            ).mockReturnValue({});

            await context.replicaDiscoveryPolicy.process({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
                data: {},
                from: {},
            });

            expect(
                context.replicaDiscoveryPolicy.statusMessageBuffer.addMessage,
            ).toHaveBeenCalledWith(expect.any(Object));
        });

        test('calls handleShareMessage for SHARE message type', async () => {
            jest.spyOn(
                context.replicaDiscoveryPolicy.shareMessageBuffer,
                'addMessage',
            ).mockReturnValue({});

            await context.replicaDiscoveryPolicy.process({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
                data: {},
                from: {},
            });

            expect(
                context.replicaDiscoveryPolicy.shareMessageBuffer.addMessage,
            ).toHaveBeenCalledWith(expect.any(Object));
        });

        test('calls handleCloseMessage for CLOSE message type', async () => {
            jest.spyOn(
                context.replicaDiscoveryPolicy.closeMessageBuffer,
                'addMessage',
            ).mockReturnValue({});

            await context.replicaDiscoveryPolicy.process({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.CLOSE,
                data: {},
                from: {},
            });

            expect(
                context.replicaDiscoveryPolicy.closeMessageBuffer.addMessage,
            ).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    test('handleHelloMessage publishes STATUS message with correct data', async () => {
        const from = { address: 'test-address' };
        const mockSenderCredentials = {};

        context.replicaDiscoveryPolicy.getSenderCredentials = jest
            .fn()
            .mockReturnValue(mockSenderCredentials);

        await context.replicaDiscoveryPolicy.handleHelloMessage({ from });

        expect(
            context.replicaDiscoveryPolicy.stateManager.getCurrentState,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.getSenderCredentials,
        ).toHaveBeenCalled();
        expect(context.sendToQueueStub).toHaveBeenCalledWith(from.address, {
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
            from: mockSenderCredentials,
        });
    });

    test('handleShareMessage processes message and updates state if reload is allowed', async () => {
        const message = {};

        context.replicaDiscoveryPolicy.interPhaseMutex = new Mutex();

        jest.spyOn(context.stateManager, 'aggregateShareState').mockReturnValue(
            {},
        );
        jest.spyOn(context.stateManager, 'shouldReload').mockReturnValue(true);
        jest.spyOn(context.stateManager, 'normalizeState').mockReturnValue({});
        jest.spyOn(context.stateManager, 'updateState');

        jest.spyOn(
            context.replicaDiscoveryPolicy.interPhaseMutex,
            'acquire',
        ).mockResolvedValue();
        jest.spyOn(context.replicaDiscoveryPolicy.interPhaseMutex, 'release');

        await context.replicaDiscoveryPolicy.handleShareMessage(message);

        expect(context.stateManager.shouldReload).toHaveBeenCalled();
        expect(context.stateManager.normalizeState).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.marketsManager.reloadActive,
        ).toHaveBeenCalled();
        expect(context.stateManager.updateState).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.acquire,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.release,
        ).toHaveBeenCalled();
    });

    test('handleShareMessage processes message and and avoids state update if not needed', async () => {
        const message = {};

        context.replicaDiscoveryPolicy.interPhaseMutex = new Mutex();

        jest.spyOn(context.stateManager, 'aggregateShareState').mockReturnValue(
            {},
        );
        jest.spyOn(context.stateManager, 'shouldReload').mockReturnValue(false);
        jest.spyOn(context.stateManager, 'normalizeState').mockReturnValue({});
        jest.spyOn(context.stateManager, 'updateState');

        jest.spyOn(
            context.replicaDiscoveryPolicy.interPhaseMutex,
            'acquire',
        ).mockResolvedValue();
        jest.spyOn(context.replicaDiscoveryPolicy.interPhaseMutex, 'release');

        await context.replicaDiscoveryPolicy.handleShareMessage(message);

        expect(context.stateManager.shouldReload).toHaveBeenCalled();
        expect(context.stateManager.normalizeState).not.toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.marketsManager.reloadActive,
        ).not.toHaveBeenCalled();
        expect(context.stateManager.updateState).not.toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.acquire,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.release,
        ).toHaveBeenCalled();
    });

    test('broadcastHello sends a HELLO message', async () => {
        context.replicaDiscoveryPolicy.interPhaseMutex = new Mutex();

        jest.spyOn(
            context.replicaDiscoveryPolicy.interPhaseMutex,
            'acquire',
        ).mockResolvedValue();
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcast',
        ).mockResolvedValue();

        const mockSenderCredentials = {};
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getSenderCredentials',
        ).mockReturnValue(mockSenderCredentials);

        await context.replicaDiscoveryPolicy.broadcastHello();

        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.acquire,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.getSenderCredentials,
        ).toHaveBeenCalled();
        expect(context.replicaDiscoveryPolicy.broadcast).toHaveBeenCalledWith({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
            from: mockSenderCredentials,
        });
    });

    test('broadcastShare sends a SHARE message', async () => {
        context.replicaDiscoveryPolicy.interPhaseMutex = new Mutex();

        jest.spyOn(
            context.replicaDiscoveryPolicy.interPhaseMutex,
            'release',
        ).mockResolvedValue();
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcast',
        ).mockResolvedValue();

        const mockSenderCredentials = {};
        const mockMessage = {};
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getSenderCredentials',
        ).mockReturnValue(mockSenderCredentials);

        await context.replicaDiscoveryPolicy.broadcastShare(mockMessage);

        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.release,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.getSenderCredentials,
        ).toHaveBeenCalled();
        expect(context.replicaDiscoveryPolicy.broadcast).toHaveBeenCalledWith({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
            data: mockMessage,
            from: mockSenderCredentials,
        });
    });

    test('broadcastClose sends a CLOSE message', async () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcast',
        ).mockResolvedValue();

        const mockSenderCredentials = {};
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getSenderCredentials',
        ).mockReturnValue(mockSenderCredentials);

        await context.replicaDiscoveryPolicy.broadcastClose();

        expect(
            context.replicaDiscoveryPolicy.getSenderCredentials,
        ).toHaveBeenCalled();
        expect(context.replicaDiscoveryPolicy.broadcast).toHaveBeenCalledWith({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.CLOSE,
            from: mockSenderCredentials,
        });
    });

    test('handleStatusMessage processes status messages and updates state', async () => {
        const replicaStatus = {};
        const statusBuffer = [{}];

        jest.spyOn(
            context.replicaDiscoveryPolicy.statusMessageBuffer,
            'useBuffer',
        ).mockReturnValue(statusBuffer);

        jest.spyOn(context.stateManager, 'aggregateState').mockReturnValue(
            replicaStatus,
        );

        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'handleTargetStart',
        ).mockResolvedValue();
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcastShare',
        ).mockResolvedValue();

        await context.replicaDiscoveryPolicy.handleStatusMessage();

        expect(context.stateManager.aggregateState).toHaveBeenCalledWith(
            statusBuffer,
        );
        expect(
            context.replicaDiscoveryPolicy.statusMessageBuffer.getBuffer(),
        ).toEqual([]);
        expect(
            context.replicaDiscoveryPolicy.handleTargetStart,
        ).toHaveBeenCalledWith(replicaStatus);
        expect(
            context.replicaDiscoveryPolicy.broadcastShare,
        ).toHaveBeenCalledWith(replicaStatus);
    });

    test('handleCloseMessage processes close messages and updates state', async () => {
        const replicaStatus = {};
        const normalizedState = {};
        const statusBuffer = [{}];

        context.replicaDiscoveryPolicy.interPhaseMutex = new Mutex();

        jest.spyOn(
            context.replicaDiscoveryPolicy.closeMessageBuffer,
            'useBuffer',
        ).mockReturnValue(statusBuffer);
        jest.spyOn(context.stateManager, 'aggregateCloseState').mockReturnValue(
            replicaStatus,
        );
        jest.spyOn(context.stateManager, 'normalizeState').mockReturnValue(
            normalizedState,
        );
        jest.spyOn(
            context.replicaDiscoveryPolicy.marketsManager,
            'reloadActive',
        ).mockResolvedValue();

        jest.spyOn(
            context.replicaDiscoveryPolicy.interPhaseMutex,
            'acquire',
        ).mockResolvedValue();
        jest.spyOn(context.replicaDiscoveryPolicy.interPhaseMutex, 'release');

        await context.replicaDiscoveryPolicy.handleCloseMessage();

        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.acquire,
        ).toHaveBeenCalled();
        expect(context.stateManager.aggregateCloseState).toHaveBeenCalledWith(
            statusBuffer,
        );
        expect(
            context.replicaDiscoveryPolicy.closeMessageBuffer.getBuffer(),
        ).toEqual([]);
        expect(context.stateManager.normalizeState).toHaveBeenCalledWith(
            replicaStatus,
        );
        expect(
            context.replicaDiscoveryPolicy.marketsManager.reloadActive,
        ).toHaveBeenCalledWith(normalizedState);
        expect(
            context.replicaDiscoveryPolicy.interPhaseMutex.release,
        ).toHaveBeenCalled();
    });

    test('handleTargetStart does nothing if already started', async () => {
        context.replicaDiscoveryPolicy.hasStarted = true;

        await context.replicaDiscoveryPolicy.handleTargetStart({});

        expect(
            context.replicaDiscoveryPolicy.marketsManager.start,
        ).not.toHaveBeenCalled();
    });

    test('handleTargetStart starts marketsManager with normalized state if not started', async () => {
        const replicaStatus = {};
        const normalizedState = {};
        context.replicaDiscoveryPolicy.hasStarted = false;

        jest.spyOn(context.stateManager, 'normalizeState').mockReturnValue(
            normalizedState,
        );
        jest.spyOn(
            context.replicaDiscoveryPolicy.marketsManager,
            'start',
        ).mockResolvedValue();
        context.replicaDiscoveryPolicy.resolveStartPromise = jest.fn();

        await context.replicaDiscoveryPolicy.handleTargetStart(replicaStatus);

        expect(context.stateManager.normalizeState).toHaveBeenCalledWith(
            replicaStatus,
        );
        expect(
            context.replicaDiscoveryPolicy.marketsManager.start,
        ).toHaveBeenCalledWith(normalizedState);
        expect(
            context.replicaDiscoveryPolicy.resolveStartPromise,
        ).toHaveBeenCalled();
        expect(context.replicaDiscoveryPolicy.hasStarted).toBe(true);
    });

    test('initPolicy initializes components and schedules greeting', () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'initPhaseControl',
        ).mockImplementation(() => {});
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'initStateManager',
        ).mockImplementation(() => {});
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'scheduleGreeting',
        ).mockImplementation(() => {});

        context.replicaDiscoveryPolicy.initPolicy();

        expect(
            context.replicaDiscoveryPolicy.initPhaseControl,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.initStateManager,
        ).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.scheduleGreeting,
        ).toHaveBeenCalledWith(
            context.replicaDiscoveryPolicy.initializationDelay,
        );
    });

    test('initConfig sets configuration values correctly', () => {
        context.replicaDiscoveryPolicy.initConfig({
            initializationDelay: 200,
            statusDebounceDelay: 100,
            shareDebounceDelay: 125,
            closeDebounceDelay: 150,
            discoveryInterval: 5000,
        });

        expect(context.replicaDiscoveryPolicy.initializationDelay).toBe(200);
        expect(context.replicaDiscoveryPolicy.discoveryInterval).toBe(5000);

        expect(context.replicaDiscoveryPolicy.statusMessageBuffer.delay).toBe(
            100,
        );
        expect(context.replicaDiscoveryPolicy.shareMessageBuffer.delay).toBe(
            125,
        );
        expect(context.replicaDiscoveryPolicy.closeMessageBuffer.delay).toBe(
            150,
        );
    });

    test('initPhaseControl initializes control variables', () => {
        context.replicaDiscoveryPolicy.initPhaseControl();

        expect(context.replicaDiscoveryPolicy.hasStarted).toBe(false);
        expect(context.replicaDiscoveryPolicy.startPromise).toBeInstanceOf(
            Promise,
        );
        expect(context.replicaDiscoveryPolicy.interPhaseMutex).toBeInstanceOf(
            Mutex,
        );
    });

    test('initStateManager initializes stateManager correctly', () => {
        context.replicaDiscoveryPolicy.initStateManager();

        expect(context.stateManagerFactory.create).toHaveBeenCalledWith({
            marketsManager: context.replicaDiscoveryPolicy.marketsManager,
            replicaDiscoveryPolicy: context.replicaDiscoveryPolicy,
        });
        expect(context.replicaDiscoveryPolicy.stateManager).toBeDefined();
    });

    test('scheduleGreeting schedules broadcastHello after the specified delay', () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcastHello',
        ).mockImplementation();
        jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
            fn();
        });

        const delay = 1000;

        context.replicaDiscoveryPolicy.scheduleGreeting(delay);

        expect(setTimeout).toHaveBeenCalled();
        expect(
            context.replicaDiscoveryPolicy.broadcastHello,
        ).toHaveBeenCalled();
    });

    test('scheduleResyncTask sets up interval for broadcastHello', () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcastHello',
        ).mockImplementation();
        jest.spyOn(global, 'setInterval').mockImplementation((fn) => {
            fn();
            return 'mockedIntervalId';
        });

        const interval = 5000;

        context.replicaDiscoveryPolicy.scheduleResyncTask(interval);

        expect(global.setInterval).toHaveBeenCalledWith(
            expect.any(Function),
            interval,
        );
        expect(
            context.replicaDiscoveryPolicy.broadcastHello,
        ).toHaveBeenCalled();
    });

    test('getSenderCredentials returns correct sender credentials', () => {
        const expectedAddress = 'test-address';
        const expectedIdentity = 'mock-identity';
        context.marketsManager.externalExchangeId = expectedIdentity;

        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getPrivateQueueAddress',
        ).mockReturnValue(expectedAddress);

        const senderCredentials =
            context.replicaDiscoveryPolicy.getSenderCredentials();

        expect(senderCredentials).toEqual({
            address: expectedAddress,
            identity: expectedIdentity,
        });
        expect(
            context.replicaDiscoveryPolicy.getPrivateQueueAddress,
        ).toHaveBeenCalled();
    });
});
