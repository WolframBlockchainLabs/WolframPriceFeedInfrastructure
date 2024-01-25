import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/ReplicaDiscoveryPolicy.js';
import Cron from 'croner';

jest.mock('croner', () => {
    return jest.fn().mockImplementation(() => {
        return {};
    });
});

describe('[ReplicaDiscoveryPolicy]: Test Suite', () => {
    const context = {};

    beforeEach(() => {
        context.rabbitGroupName = 'testGroup';
        context.replicaDiscoveryConfig = {
            initializationDelay: 200,
            debounceDelay: 100,
        };

        context.amqpClientStub = {
            publish: jest.fn().mockResolvedValue(),
        };

        context.amqpManagementTargetStub = {
            getStatusHandler: jest.fn(),
            startHandler: jest.fn(),
            reloadHandler: jest.fn(),
            identity: 'mock-identity',
        };

        context.replicaDiscoveryPolicy = new ReplicaDiscoveryPolicy({
            rabbitGroupName: context.rabbitGroupName,
            replicaDiscovery: context.replicaDiscoveryConfig,
            amqpClient: context.amqpClientStub,
            amqpManagementTarget: context.amqpManagementTargetStub,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('constructor initializes with modified rabbitGroupName and other properties', () => {
        jest.spyOn(
            ReplicaDiscoveryPolicy.prototype,
            'validateConfig',
        ).mockImplementation(() => {});

        const replicaDiscoveryPolicy = new ReplicaDiscoveryPolicy({
            rabbitGroupName: context.rabbitGroupName,
            replicaDiscovery: context.replicaDiscoveryConfig,
            amqpClient: context.amqpClientStub,
            amqpManagementTarget: context.amqpManagementTargetStub,
        });

        expect(replicaDiscoveryPolicy.rabbitGroupName).toBe(
            `${context.rabbitGroupName}::discovery`,
        );
        expect(replicaDiscoveryPolicy.replicaDiscovery).toBe(
            context.replicaDiscoveryConfig,
        );
        expect(replicaDiscoveryPolicy.hasStarted).toBe(false);
        expect(replicaDiscoveryPolicy.validateConfig).toHaveBeenCalled();
    });

    test('start method initializes protocol status and schedules tasks', async () => {
        jest.spyOn(
            Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype),
            'start',
        ).mockImplementation(() => {});
        const scheduleGreetingSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'scheduleGreeting')
            .mockImplementation(() => {});
        const scheduleCronTaskSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'scheduleCronTask')
            .mockImplementation(() => {});

        context.replicaDiscoveryPolicy.startPromise = Promise.resolve();

        await context.replicaDiscoveryPolicy.start();

        expect(scheduleGreetingSpy).toHaveBeenCalledWith(
            context.replicaDiscoveryConfig.initializationDelay,
        );
        expect(scheduleCronTaskSpy).toHaveBeenCalledWith(
            context.replicaDiscoveryConfig.discoveryInterval,
        );
    });

    test('consumer method correctly handles HELLO message type', async () => {
        const message = JSON.stringify({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
            data: { statusUpdateQueue: 'queue-address' },
        });
        context.amqpManagementTargetStub.getStatusHandler.mockResolvedValue({
            someStatus: 'status',
        });

        await context.replicaDiscoveryPolicy.consumer({
            content: Buffer.from(message),
        });

        expect(context.amqpClientStub.publish).toHaveBeenCalledWith(
            'queue-address',
            expect.objectContaining({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
                data: expect.anything(),
            }),
        );
    });

    test('consumer method correctly handles STATUS message type', async () => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        const messageData = {
            status: { rateLimitMultiplier: 1 },
            from: {
                address: 'test',
                identity: context.amqpManagementTargetStub.identity,
            },
        };
        const message = JSON.stringify({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
            data: messageData,
        });
        const handleStatusUpdateSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'handleStatusUpdate')
            .mockImplementation(() => {});

        await context.replicaDiscoveryPolicy.consumer({
            content: Buffer.from(message),
        });

        jest.advanceTimersByTime(context.replicaDiscoveryConfig.debounceDelay);

        expect(context.replicaDiscoveryPolicy.messageBuffer).toContainEqual(
            messageData,
        );
        expect(setTimeout).toHaveBeenLastCalledWith(
            expect.any(Function),
            context.replicaDiscoveryConfig.debounceDelay,
        );
        expect(handleStatusUpdateSpy).toHaveBeenCalled();
        jest.useRealTimers();
    });

    test('consumer method correctly handles SHARE message type', async () => {
        const messageData = {
            status: {
                rateLimitMultiplier: 10,
                replicaMembers: ['other-address'],
            },
            from: {
                address: 'other-address',
                identity: context.amqpManagementTargetStub.identity,
            },
        };
        const message = JSON.stringify({
            type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
            data: messageData,
        });

        context.replicaDiscoveryPolicy.hasStarted = true;
        context.replicaDiscoveryPolicy.currentStatus = {
            rateLimitMultiplier: 5,
            replicaMembers: ['some-address'],
        };
        context.amqpManagementTargetStub.getStatusHandler.mockReturnValue({
            rateLimitMultiplier: 5,
        });

        await context.replicaDiscoveryPolicy.consumer({
            content: Buffer.from(message),
        });

        expect(
            context.amqpManagementTargetStub.reloadHandler,
        ).toHaveBeenCalledWith({
            rateLimitMultiplier: messageData.status.rateLimitMultiplier,
            replicaConfig: expect.anything(),
        });
    });

    test('validateConfig throws error when initializationDelay is less than debounceDelay', () => {
        const config = { initializationDelay: 50, debounceDelay: 100 };

        expect(() => {
            context.replicaDiscoveryPolicy.validateConfig(config);
        }).toThrow(
            'Initialization delay must be greater than or equal to debounce delay.',
        );
    });

    test('scheduleGreeting schedules greeting after specified delay', () => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setTimeout');
        const broadcastHelloSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'broadcastHello')
            .mockImplementation(() => {});

        context.replicaDiscoveryPolicy.scheduleGreeting(1000);

        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
        jest.advanceTimersByTime(1000);

        expect(broadcastHelloSpy).toHaveBeenCalled();
        jest.useRealTimers();
    });

    test('scheduleCronTask schedules cron task with given interval', () => {
        const interval = '* * * * *';
        context.replicaDiscoveryPolicy.scheduleCronTask(interval);

        expect(Cron).toHaveBeenCalledWith(interval, expect.any(Function));
    });

    test('handleStatusUpdate updates current status and calls necessary methods', async () => {
        const replicaStatus = { replicaMembers: ['test1', 'test2'] };
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'aggregateReplicaStatus',
        ).mockReturnValue(replicaStatus);
        const handleTargetStartSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'handleTargetStart')
            .mockResolvedValue();
        const broadcastShareSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'broadcastShare')
            .mockResolvedValue();

        await context.replicaDiscoveryPolicy.handleStatusUpdate();

        expect(context.replicaDiscoveryPolicy.replicaMembers).toEqual(
            replicaStatus.replicaMembers,
        );
        expect(context.replicaDiscoveryPolicy.messageBuffer).toEqual([]);
        expect(handleTargetStartSpy).toHaveBeenCalledWith(replicaStatus);
        expect(broadcastShareSpy).toHaveBeenCalledWith(replicaStatus);
    });

    test('handleTargetStart calls startHandler and updates state if not started', async () => {
        context.replicaDiscoveryPolicy.hasStarted = false;
        const status = { rateLimitMultiplier: 1 };
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getTargetState',
        ).mockReturnValue({ someState: 'state' });

        await context.replicaDiscoveryPolicy.handleTargetStart(status);

        expect(
            context.amqpManagementTargetStub.startHandler,
        ).toHaveBeenCalledWith({ someState: 'state' });
        expect(context.replicaDiscoveryPolicy.hasStarted).toBe(true);
    });

    test('broadcastHello sends correct HELLO message', async () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcast',
        ).mockImplementation(() => {});

        await context.replicaDiscoveryPolicy.broadcastHello();

        expect(context.replicaDiscoveryPolicy.broadcast).toHaveBeenCalledWith(
            expect.objectContaining({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
                data: expect.anything(),
            }),
        );
    });

    test('broadcastShare sends correct SHARE message', async () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'broadcast',
        ).mockImplementation(() => {});

        const status = { rateLimitMultiplier: 1 };
        await context.replicaDiscoveryPolicy.broadcastShare(status);

        expect(context.replicaDiscoveryPolicy.broadcast).toHaveBeenCalledWith(
            expect.objectContaining({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
                data: expect.objectContaining({
                    status,
                    from: expect.anything(),
                }),
            }),
        );
    });

    test('aggregateReplicaStatus computes the correct current status', () => {
        context.replicaDiscoveryPolicy.messageBuffer = [
            {
                status: { rateLimitMultiplier: 2 },
                from: { address: 'address1', identity: 'other-identity' },
            },
            {
                status: { rateLimitMultiplier: 1 },
                from: {
                    address: 'address2',
                    identity: context.amqpManagementTargetStub.identity,
                },
            },
            {
                status: { rateLimitMultiplier: 3 },
                from: {
                    address: 'address3',
                    identity: context.amqpManagementTargetStub.identity,
                },
            },
        ];

        const currentStatus =
            context.replicaDiscoveryPolicy.aggregateReplicaStatus();

        expect(currentStatus.rateLimitMultiplier).toBe(3);

        expect(currentStatus.replicaMembers).toEqual(['address2', 'address3']);
    });

    test('handleStatusMessage clears existing debounceTimeout and sets a new one', async () => {
        jest.useFakeTimers();
        const handleStatusUpdateSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'handleStatusUpdate')
            .mockImplementation(() => {});

        context.replicaDiscoveryPolicy.debounceTimeout = setTimeout(
            () => {},
            1000,
        );
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

        const sampleData = {
            status: { rateLimitMultiplier: 1 },
            from: { address: 'address1', identity: 'identity1' },
        };

        context.replicaDiscoveryPolicy.handleStatusMessage(sampleData);

        expect(clearTimeoutSpy).toHaveBeenCalled();

        jest.advanceTimersByTime(
            context.replicaDiscoveryPolicy.replicaDiscovery.debounceDelay,
        );

        expect(handleStatusUpdateSpy).toHaveBeenCalled();

        jest.useRealTimers();
    });

    test('handleShareMessage processes message when shouldCallReloadHandler returns false', async () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'shouldCallReloadHandler',
        ).mockReturnValue(false);

        const sampleData = {
            status: { rateLimitMultiplier: 1, replicaMembers: [] },
        };
        jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getTargetState',
        ).mockReturnValue({ rateLimitMultiplier: 1 });
        jest.spyOn(
            context.replicaDiscoveryPolicy.amqpManagementTarget,
            'getStatusHandler',
        ).mockReturnValue({ rateLimitMultiplier: 1 });

        await context.replicaDiscoveryPolicy.handleShareMessage(sampleData);

        expect(
            context.amqpManagementTargetStub.reloadHandler,
        ).not.toHaveBeenCalled();
    });

    test('handleTargetStart returns early if hasStarted is true', async () => {
        context.replicaDiscoveryPolicy.hasStarted = true;

        const getTargetStateSpy = jest.spyOn(
            context.replicaDiscoveryPolicy,
            'getTargetState',
        );

        await context.replicaDiscoveryPolicy.handleTargetStart({
            someStatus: 'status',
        });

        expect(getTargetStateSpy).not.toHaveBeenCalled();
        expect(
            context.amqpManagementTargetStub.startHandler,
        ).not.toHaveBeenCalled();
    });

    test('shouldCallReloadHandler checks replica members and rate limit', async () => {
        jest.spyOn(
            context.replicaDiscoveryPolicy.amqpManagementTarget,
            'getStatusHandler',
        ).mockReturnValue({ rateLimitMultiplier: 1 });

        context.replicaDiscoveryPolicy.replicaMembers = ['test'];
        context.replicaDiscoveryPolicy.hasStarted = true;

        const shouldReload =
            context.replicaDiscoveryPolicy.shouldCallReloadHandler({
                replicaMembers: context.replicaDiscoveryPolicy.replicaMembers,
                rateLimitMultiplier: 2,
            });

        expect(shouldReload).toBe(true);
    });
});
