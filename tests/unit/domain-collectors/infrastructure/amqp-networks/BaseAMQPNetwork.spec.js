import BaseAMQPNetwork from '#domain-collectors/infrastructure/amqp-networks/BaseAMQPNetwork.js';
import crypto from 'crypto';

describe('[BaseAMQPNetwork]: Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.amqpClientStub = {
            initConnection: jest.fn().mockResolvedValue(),
            getChannel: jest.fn().mockReturnValue({
                addSetup: jest.fn(),
                prefetch: jest.fn(),
                assertExchange: jest.fn(),
                assertQueue: jest.fn(),
                consume: jest.fn(),
                ack: jest.fn(),
                cancel: jest.fn(),
                close: jest.fn(),
                publish: jest.fn(),
            }),
            closeConnection: jest.fn().mockResolvedValue(),
        };

        context.loggerStub = {
            warning: jest.fn(),
            error: jest.fn(),
        };

        context.retryConfig = {
            retryLimit: 3,
            retryPeriodMs: 60000,
        };

        context.baseAMQPNetwork = new BaseAMQPNetwork({
            amqpClientFactory: { create: () => context.amqpClientStub },
            rabbitGroupName: 'testGroup',
            retryConfig: context.retryConfig,
            logger: context.loggerStub,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "start" method should initialize connection and configure channel.', async () => {
        context.amqpClientStub.getChannel().addSetup.mockImplementation(() => {
            context.baseAMQPNetwork.resolveConfigureChannelPromise();
        });

        await context.baseAMQPNetwork.start();

        expect(context.amqpClientStub.initConnection).toHaveBeenCalledTimes(1);
        expect(
            context.amqpClientStub.getChannel().addSetup,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "stop" method should tear down channel and close connection.', async () => {
        await context.baseAMQPNetwork.stop();

        expect(
            context.amqpClientStub.getChannel().addSetup,
        ).toHaveBeenCalledTimes(1);
        expect(context.amqpClientStub.closeConnection).toHaveBeenCalledTimes(1);
    });

    test('the "configureRabbitMQChannel" method should set prefetch, assert exchange and queue, bind queue, and setup consumer.', async () => {
        const channel = context.amqpClientStub.getChannel();
        const setPrefetchSpy = jest
            .spyOn(context.baseAMQPNetwork, 'setPrefetchCount')
            .mockResolvedValue();
        const assertExchangeSpy = jest
            .spyOn(context.baseAMQPNetwork, 'assertExchange')
            .mockResolvedValue();
        const assertQueueSpy = jest
            .spyOn(context.baseAMQPNetwork, 'assertQueue')
            .mockResolvedValue();
        const bindQueueSpy = jest
            .spyOn(context.baseAMQPNetwork, 'bindQueue')
            .mockImplementation(() => Promise.resolve());
        const assertAndBindRetryQueueSpy = jest
            .spyOn(context.baseAMQPNetwork, 'assertAndBindRetryQueue')
            .mockResolvedValue();
        const setupConsumerSpy = jest
            .spyOn(context.baseAMQPNetwork, 'setupConsumer')
            .mockResolvedValue();
        context.baseAMQPNetwork.resolveConfigureChannelPromise = jest.fn();

        await context.baseAMQPNetwork.configureRabbitMQChannel(channel);

        expect(setPrefetchSpy).toHaveBeenCalledTimes(1);
        expect(assertExchangeSpy).toHaveBeenCalledTimes(1);
        expect(assertQueueSpy).toHaveBeenCalledTimes(1);
        expect(bindQueueSpy).toHaveBeenCalledTimes(1);
        expect(assertAndBindRetryQueueSpy).toHaveBeenCalledTimes(1);
        expect(setupConsumerSpy).toHaveBeenCalledTimes(1);
        expect(
            context.baseAMQPNetwork.resolveConfigureChannelPromise,
        ).toHaveBeenCalledTimes(1);
    });

    test('the "consumer" method should return immediately if no message is provided.', async () => {
        const ackSpy = jest.spyOn(context.amqpClientStub.getChannel(), 'ack');
        const processSpy = jest.spyOn(context.baseAMQPNetwork, 'process');
        const handleRetrySpy = jest.spyOn(
            context.baseAMQPNetwork,
            'handleRetry',
        );

        await context.baseAMQPNetwork.consumer(null);

        expect(ackSpy).not.toHaveBeenCalled();
        expect(processSpy).not.toHaveBeenCalled();
        expect(handleRetrySpy).not.toHaveBeenCalled();
    });

    test('the "consumer" method should acknowledge message after processing.', async () => {
        const message = {
            content: Buffer.from(JSON.stringify({ test: 'data' })),
        };
        jest.spyOn(context.baseAMQPNetwork, 'getMessageObject').mockReturnValue(
            { test: 'data' },
        );
        jest.spyOn(context.baseAMQPNetwork, 'process').mockResolvedValue();
        const ackSpy = jest.spyOn(context.amqpClientStub.getChannel(), 'ack');

        await context.baseAMQPNetwork.consumer(message);

        expect(context.baseAMQPNetwork.process).toHaveBeenCalledWith({
            test: 'data',
        });
        expect(ackSpy).toHaveBeenCalledWith(message);
    });

    test('the "consumer" method should handle retry on error.', async () => {
        const message = {
            content: Buffer.from(JSON.stringify({ test: 'data' })),
        };
        jest.spyOn(context.baseAMQPNetwork, 'getMessageObject').mockReturnValue(
            { test: 'data' },
        );
        jest.spyOn(context.baseAMQPNetwork, 'process').mockRejectedValue(
            new Error('Test Error'),
        );
        const handleRetrySpy = jest
            .spyOn(context.baseAMQPNetwork, 'handleRetry')
            .mockResolvedValue();

        await context.baseAMQPNetwork.consumer(message);

        expect(context.baseAMQPNetwork.process).toHaveBeenCalledWith({
            test: 'data',
        });
        expect(handleRetrySpy).toHaveBeenCalledWith(message);
    });

    test('the "consumer" method should process message and handle retry if getMessageObject throws error.', async () => {
        const message = {
            content: Buffer.from(JSON.stringify({ test: 'data' })),
        };
        const processSpy = jest.spyOn(context.baseAMQPNetwork, 'process');
        jest.spyOn(
            context.baseAMQPNetwork,
            'getMessageObject',
        ).mockImplementation(() => {
            throw new Error('Test Error');
        });
        const handleRetrySpy = jest
            .spyOn(context.baseAMQPNetwork, 'handleRetry')
            .mockResolvedValue();

        await context.baseAMQPNetwork.consumer(message);

        expect(processSpy).not.toHaveBeenCalled();
        expect(handleRetrySpy).toHaveBeenCalledWith(message);
    });

    test('the "handleChannelTeardown" method should cancel consumer if exists.', async () => {
        const channel = context.amqpClientStub.getChannel();
        context.baseAMQPNetwork.consumerTag = 'testTag';
        await context.baseAMQPNetwork.handleChannelTeardown(channel);

        expect(channel.cancel).toHaveBeenCalledWith('testTag');
    });

    test('the "setPrefetchCount" method should set prefetch count.', async () => {
        const channel = context.amqpClientStub.getChannel();
        await context.baseAMQPNetwork.setPrefetchCount(channel);

        expect(channel.prefetch).toHaveBeenCalledWith(
            BaseAMQPNetwork.PREFETCH_COUNT,
        );
    });

    test('the "assertExchange" method should assert exchange.', async () => {
        const channel = context.amqpClientStub.getChannel();
        await context.baseAMQPNetwork.assertExchange(channel);

        expect(channel.assertExchange).toHaveBeenCalledWith(
            context.baseAMQPNetwork.rabbitGroupName,
            BaseAMQPNetwork.EXCHANGE_TYPE,
            { durable: false },
        );
    });

    test('the "assertQueue" method should assert queue and set rabbitQueueId.', async () => {
        const channel = context.amqpClientStub.getChannel();
        const queueName = 'testQueue';
        jest.spyOn(
            context.baseAMQPNetwork,
            'generatePrivateQueueName',
        ).mockResolvedValue(queueName);
        channel.assertQueue.mockResolvedValue({ queue: queueName });

        await context.baseAMQPNetwork.assertQueue(channel);

        expect(channel.assertQueue).toHaveBeenCalledWith(queueName, {
            exclusive: true,
            durable: false,
            autoDelete: true,
        });
        expect(context.baseAMQPNetwork.rabbitQueueId).toBe(queueName);
    });

    test('the "setupConsumer" method should set consumer and consumer tag.', async () => {
        const channel = context.amqpClientStub.getChannel();
        const queueName = 'testQueue';
        context.baseAMQPNetwork.rabbitQueueId = queueName;
        const consumerTag = 'testTag';
        channel.consume.mockResolvedValue({ consumerTag });

        await context.baseAMQPNetwork.setupConsumer(channel);

        expect(channel.consume).toHaveBeenCalledWith(
            queueName,
            expect.any(Function),
        );
        expect(context.baseAMQPNetwork.consumerTag).toBe(consumerTag);
    });

    test('the "handleRetry" method should retry message within limit and log warnings.', async () => {
        const channel = context.amqpClientStub.getChannel();
        const message = {
            properties: { headers: {} },
            content: Buffer.from('{}'),
        };
        const error = new Error('Test Error');
        context.baseAMQPNetwork.rabbitQueueId = 'testQueue';

        await context.baseAMQPNetwork.handleRetry(message, error);

        expect(context.loggerStub.warning).toHaveBeenCalledTimes(1);
        expect(channel.publish).toHaveBeenCalledWith(
            '',
            `${context.baseAMQPNetwork.rabbitQueueId}-retry`,
            message.content,
            { headers: { retryCount: 2 } },
        );
        expect(channel.ack).toHaveBeenCalledWith(message);
    });

    test('the "handleRetry" method should discard message after exceeding retry limit and log errors.', async () => {
        const channel = context.amqpClientStub.getChannel();
        const message = {
            properties: {
                headers: { retryCount: context.retryConfig.retryLimit + 1 },
            },
            content: Buffer.from('{}'),
        };
        const error = new Error('Test Error');

        await context.baseAMQPNetwork.handleRetry(message, error);

        expect(context.loggerStub.error).toHaveBeenCalledTimes(1);
        expect(channel.ack).toHaveBeenCalledWith(message);
    });

    test('the "handleRetry" method should handle messages with undefined headers.', async () => {
        const channel = context.amqpClientStub.getChannel();
        const message = {
            properties: { headers: undefined },
            content: Buffer.from('{}'),
        };
        const error = new Error('Test Error');
        const warningSpy = jest.spyOn(context.loggerStub, 'warning');
        const errorSpy = jest.spyOn(context.loggerStub, 'error');
        const publishSpy = jest.spyOn(channel, 'publish');
        const ackSpy = jest.spyOn(channel, 'ack');

        await context.baseAMQPNetwork.handleRetry(message, error);

        expect(warningSpy).toHaveBeenCalledWith({
            message: `[${context.baseAMQPNetwork.constructor.name}]: Error during message processing. Retrying...`,
            retryCount: 1,
            error,
        });
        expect(publishSpy).toHaveBeenCalledWith(
            '',
            context.baseAMQPNetwork.getRetryQueueAddress(),
            message.content,
            { headers: { retryCount: 2 } },
        );
        expect(errorSpy).not.toHaveBeenCalled();
        expect(ackSpy).toHaveBeenCalledWith(message);
    });

    test('the "generatePrivateQueueName" method should generate a unique queue name.', async () => {
        const id = 'unique-id';
        jest.spyOn(
            context.baseAMQPNetwork,
            'generatePrivateQueueId',
        ).mockResolvedValue(id);

        const queueName =
            await context.baseAMQPNetwork.generatePrivateQueueName();

        expect(queueName).toBe(
            `${context.baseAMQPNetwork.rabbitGroupName}::${id}`,
        );
    });

    test('the "generatePrivateQueueId" method should generate a unique queue ID.', async () => {
        const randomBytes = Buffer.from('random-bytes');
        jest.spyOn(crypto, 'randomBytes').mockImplementation((size, callback) =>
            callback(null, randomBytes),
        );
        const id = await context.baseAMQPNetwork.generatePrivateQueueId();

        expect(id).toBe(randomBytes.toString('base64url'));
    });

    test('the "bindQueue" method should throw an error.', async () => {
        await expect(context.baseAMQPNetwork.bindQueue()).rejects.toThrow(
            `bindQueue method is not implemented for: ${context.baseAMQPNetwork.constructor.name}`,
        );
    });

    test('the "process" method should throw an error.', async () => {
        await expect(context.baseAMQPNetwork.process()).rejects.toThrow(
            `process method is not implemented for: ${context.baseAMQPNetwork.constructor.name}`,
        );
    });
});
