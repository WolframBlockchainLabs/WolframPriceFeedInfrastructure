import StatusUpdatePolicy from '../../../../../lib/domain-collectors/infrastructure/amqp-policies/StatusUpdatePolicy.js';

describe('[domain-collectors/infrastructure/amqp-policies]: StatusUpdatePolicy Tests Suite', () => {
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
            publish: jest.fn(),
        };

        context.statusUpdatePolicy = new StatusUpdatePolicy({
            amqpClient: context.amqpClientStub,
            rabbitGroupName: 'testGroup',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('StatusUpdatePolicy constructor should initialize with modified rabbitGroupName', () => {
        const amqpClient = {};
        const rabbitGroupName = 'testGroup';
        const instance = new StatusUpdatePolicy({
            amqpClient,
            rabbitGroupName,
        });

        expect(instance.rabbitGroupName).toBe(`${rabbitGroupName}::status`);
    });

    test('start should set handlers, call super start, and broadcast REQUEST message', async () => {
        const superStartSpy = jest
            .spyOn(Object.getPrototypeOf(StatusUpdatePolicy.prototype), 'start')
            .mockImplementation(() => {});
        const broadcastSpy = jest
            .spyOn(context.statusUpdatePolicy, 'broadcast')
            .mockResolvedValue();

        const getStatusHandler = jest.fn();
        const updateHandler = jest.fn();

        await context.statusUpdatePolicy.start({
            getStatusHandler,
            updateHandler,
        });

        expect(superStartSpy).toHaveBeenCalledTimes(1);
        expect(broadcastSpy).toHaveBeenCalledWith({
            type: StatusUpdatePolicy.MESSAGE_TYPES.REQUEST,
            data: {
                statusUpdateQueue:
                    context.statusUpdatePolicy.getPrivateQueueAddress(),
            },
        });
    });

    test('consumer should call appropriate consumer based on message type', async () => {
        const requestConsumerSpy = jest
            .spyOn(context.statusUpdatePolicy, 'requestConsumer')
            .mockResolvedValue();
        const updateConsumerSpy = jest
            .spyOn(context.statusUpdatePolicy, 'updateConsumer')
            .mockResolvedValue();

        const requestMessage = {
            content: Buffer.from(
                JSON.stringify({
                    type: StatusUpdatePolicy.MESSAGE_TYPES.REQUEST,
                    data: {},
                }),
            ),
        };
        const updateMessage = {
            content: Buffer.from(
                JSON.stringify({
                    type: StatusUpdatePolicy.MESSAGE_TYPES.UPDATE,
                    data: {},
                }),
            ),
        };

        await context.statusUpdatePolicy.consumer(requestMessage);
        await context.statusUpdatePolicy.consumer(updateMessage);

        expect(requestConsumerSpy).toHaveBeenCalledTimes(1);
        expect(updateConsumerSpy).toHaveBeenCalledTimes(1);
    });

    test('requestConsumer should publish status update', async () => {
        const getStatusHandlerStub = jest
            .fn()
            .mockResolvedValue({ currentStatus: 'OK' });
        context.statusUpdatePolicy.getStatusHandler = getStatusHandlerStub;

        const statusUpdateQueue = 'statusQueue';
        await context.statusUpdatePolicy.requestConsumer({ statusUpdateQueue });

        expect(getStatusHandlerStub).toHaveBeenCalledTimes(1);
        expect(context.amqpClientStub.publish).toHaveBeenCalledWith(
            statusUpdateQueue,
            {
                type: StatusUpdatePolicy.MESSAGE_TYPES.UPDATE,
                data: { currentStatus: 'OK' },
            },
        );
    });

    test('updateConsumer should call updateHandler with newRateLimitMultiplier', async () => {
        const updateHandlerStub = jest.fn().mockResolvedValue();
        context.statusUpdatePolicy.updateHandler = updateHandlerStub;

        const newRateLimitMultiplier = 1.5;
        await context.statusUpdatePolicy.updateConsumer({
            newRateLimitMultiplier,
        });

        expect(updateHandlerStub).toHaveBeenCalledWith(newRateLimitMultiplier);
    });
});
