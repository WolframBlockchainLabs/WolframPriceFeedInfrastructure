import ReplicaDiscoveryPolicy from '#domain-collectors/infrastructure/amqp-policies/ReplicaDiscoveryPolicy.js';

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
            'validateReplicaDiscoveryConfig',
        ).mockImplementation(() => {});

        const replicaDiscoveryPolicy = new ReplicaDiscoveryPolicy({
            rabbitGroupName: context.rabbitGroupName,
            replicaDiscovery: context.replicaDiscoveryConfig,
            amqpClient: context.amqpClientStub,
            amqpManagementTarget: context.amqpManagementTargetStub,
        });

        expect(replicaDiscoveryPolicy.rabbitGroupName).toBe(
            `${context.rabbitGroupName}::status`,
        );
        expect(replicaDiscoveryPolicy.replicaDiscovery).toBe(
            context.replicaDiscoveryConfig,
        );
        expect(replicaDiscoveryPolicy.currentProtocolStatus).toBe(
            ReplicaDiscoveryPolicy.PROTOCOL_STATUSES.INITIALIZING,
        );
        expect(
            replicaDiscoveryPolicy.validateReplicaDiscoveryConfig,
        ).toHaveBeenCalled();
    });

    test('start method initializes protocol status and broadcasts HELLO message', async () => {
        jest.useFakeTimers();

        const superStartSpy = jest
            .spyOn(
                Object.getPrototypeOf(ReplicaDiscoveryPolicy.prototype),
                'start',
            )
            .mockImplementation(() => {});

        const broadcastSpy = jest
            .spyOn(context.replicaDiscoveryPolicy, 'broadcast')
            .mockImplementation(() => {});

        await context.replicaDiscoveryPolicy.start();

        jest.advanceTimersByTime(
            context.replicaDiscoveryConfig.initializationDelay,
        );

        expect(superStartSpy).toHaveBeenCalled();
        expect(broadcastSpy).toHaveBeenCalled();
        expect(context.replicaDiscoveryPolicy.currentProtocolStatus).toBe(
            ReplicaDiscoveryPolicy.PROTOCOL_STATUSES.DEBATING,
        );
        jest.useRealTimers();
    });

    test('setProtocolStatus method updates currentProtocolStatus', () => {
        const newStatus = ReplicaDiscoveryPolicy.PROTOCOL_STATUSES.RUNNING;
        context.replicaDiscoveryPolicy.setProtocolStatus(newStatus);

        expect(context.replicaDiscoveryPolicy.currentProtocolStatus).toBe(
            newStatus,
        );
    });

    test('validateReplicaDiscoveryConfig should throw if initializationDelay is lower than debounceDelay', () => {
        expect(() => {
            context.replicaDiscoveryPolicy.validateReplicaDiscoveryConfig({
                initializationDelay: 10,
                debounceDelay: 20,
            });
        }).toThrow(Error);
    });

    test('clears existing debounceTimeout before setting a new one', async () => {
        const setTimeoutMock = jest
            .spyOn(global, 'setTimeout')
            .mockImplementation(() => 'mockTimeoutId');
        const clearTimeoutMock = jest
            .spyOn(global, 'clearTimeout')
            .mockImplementation(() => {});

        context.replicaDiscoveryPolicy.debounceTimeout = 'existingTimeoutId';

        const data = { someData: 'data' };
        await context.replicaDiscoveryPolicy.statusConsumer(data);

        expect(clearTimeoutMock).toHaveBeenCalledWith('existingTimeoutId');
        expect(setTimeoutMock).toHaveBeenCalled();
    });

    describe('consumer method', () => {
        test('handles HELLO message type', async () => {
            const message = JSON.stringify({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.HELLO,
                data: { statusUpdateQueue: 'queue-address' },
            });
            context.amqpManagementTargetStub.getStatusHandler.mockResolvedValue(
                { someStatus: 'status' },
            );

            await context.replicaDiscoveryPolicy.consumer({
                content: Buffer.from(message),
            });

            expect(context.amqpClientStub.publish).toHaveBeenCalledWith(
                'queue-address',
                expect.anything(),
            );
        });

        test('handles STATUS message type', async () => {
            const message = JSON.stringify({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.STATUS,
                data: {
                    status: {
                        rateLimitMultiplier: 1,
                    },
                    from: {
                        address: 'test',
                        identity: context.amqpManagementTargetStub.identity,
                    },
                },
            });

            const broadcastSpy = jest
                .spyOn(context.replicaDiscoveryPolicy, 'broadcast')
                .mockImplementation(() => {});

            jest.useFakeTimers();
            await context.replicaDiscoveryPolicy.consumer({
                content: Buffer.from(message),
            });

            jest.advanceTimersByTime(
                context.replicaDiscoveryConfig.debounceDelay,
            );

            return Promise.resolve().then(() => {
                expect(broadcastSpy).toHaveBeenCalled();
                expect(
                    context.amqpManagementTargetStub.startHandler,
                ).toHaveBeenCalled();
                expect(
                    context.replicaDiscoveryPolicy.messageBuffer,
                ).toHaveLength(1);
                jest.useRealTimers();
            });
        });

        test('handles SHARE message type when conditions are met', async () => {
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
            context.amqpManagementTargetStub.getStatusHandler.mockReturnValue({
                rateLimitMultiplier: 5,
            });
            context.replicaDiscoveryPolicy.setProtocolStatus(
                ReplicaDiscoveryPolicy.PROTOCOL_STATUSES.DEBATING,
            );

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

        test('handles SHARE message type when conditions are not met', async () => {
            const messageData = {
                status: { rateLimitMultiplier: 4 },
                from: {
                    address:
                        context.replicaDiscoveryPolicy.getPrivateQueueAddress(),
                    identity: 'mock-identity',
                },
            };
            const message = JSON.stringify({
                type: ReplicaDiscoveryPolicy.MESSAGE_TYPES.SHARE,
                data: messageData,
            });
            context.amqpManagementTargetStub.getStatusHandler.mockReturnValue({
                rateLimitMultiplier: 5,
            });

            await context.replicaDiscoveryPolicy.consumer({
                content: Buffer.from(message),
            });

            expect(
                context.amqpManagementTargetStub.reloadHandler,
            ).not.toHaveBeenCalled();
        });
    });
});
