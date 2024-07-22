import BroadcastAMQPNetwork from '#domain-collectors/infrastructure/amqp-networks/BroadcastAMQPNetwork.js';

describe('[BroadcastAMQPNetwork]: Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.amqpClientStub = {
            getChannel: jest.fn().mockReturnValue({
                bindQueue: jest.fn(),
                publish: jest.fn(),
            }),
        };

        context.loggerStub = {
            warning: jest.fn(),
            error: jest.fn(),
        };

        context.retryConfig = {
            retryLimit: 3,
            retryPeriodMs: 60000,
        };

        context.broadcastAMQPNetwork = new BroadcastAMQPNetwork({
            amqpClientFactory: { create: () => context.amqpClientStub },
            rabbitGroupName: 'testGroup',
            retryConfig: context.retryConfig,
            logger: context.loggerStub,
        });

        context.broadcastAMQPNetwork.rabbitQueueId = 'testQueue';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "bindQueue" method should bind queue to exchange.', async () => {
        const channel = context.amqpClientStub.getChannel();
        await context.broadcastAMQPNetwork.bindQueue(channel);

        expect(channel.bindQueue).toHaveBeenCalledWith(
            'testQueue',
            'testGroup',
            '',
        );
    });

    test('the "broadcast" method should publish message to exchange.', async () => {
        const message = { test: 'data' };
        const channel = context.amqpClientStub.getChannel();
        await context.broadcastAMQPNetwork.broadcast(message);

        expect(channel.publish).toHaveBeenCalledWith(
            'testGroup',
            '',
            Buffer.from(JSON.stringify(message)),
        );
    });
});
