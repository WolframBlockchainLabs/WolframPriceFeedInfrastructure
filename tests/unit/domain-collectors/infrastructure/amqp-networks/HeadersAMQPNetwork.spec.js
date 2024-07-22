import BaseAMQPNetwork from '#domain-collectors/infrastructure/amqp-networks/BaseAMQPNetwork.js';
import HeadersAMQPNetwork from '#domain-collectors/infrastructure/amqp-networks/HeadersAMQPNetwork.js';

describe('[HeadersAMQPNetwork]: Tests Suite', () => {
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

        context.headersAMQPNetwork = new HeadersAMQPNetwork({
            amqpClientFactory: { create: () => context.amqpClientStub },
            rabbitGroupName: 'testGroup',
            retryConfig: context.retryConfig,
            logger: context.loggerStub,
        });

        context.headersAMQPNetwork.rabbitQueueId = 'testQueue';
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "start" method should set headers and call super start.', async () => {
        const headers = { key: 'value' };
        const startSpy = jest
            .spyOn(BaseAMQPNetwork.prototype, 'start')
            .mockResolvedValue();

        await context.headersAMQPNetwork.start(headers);

        expect(context.headersAMQPNetwork.headers).toEqual(headers);
        expect(startSpy).toHaveBeenCalledTimes(1);
    });

    test('the "bindQueue" method should bind queue to exchange with headers.', async () => {
        const channel = context.amqpClientStub.getChannel();
        context.headersAMQPNetwork.headers = { key: 'value' };
        await context.headersAMQPNetwork.bindQueue(channel);

        expect(channel.bindQueue).toHaveBeenCalledWith(
            'testQueue',
            'testGroup',
            '',
            { 'x-match': 'any', key: 'value' },
        );
    });

    test('the "send" method should publish message with headers.', async () => {
        const message = { test: 'data' };
        const headers = { key: 'value' };
        const sendToExchangeSpy = jest.spyOn(
            context.headersAMQPNetwork,
            'sendToExchange',
        );

        await context.headersAMQPNetwork.send(message, headers);

        expect(sendToExchangeSpy).toHaveBeenCalledWith({
            message,
            headers,
            exchange: 'testGroup',
        });
    });

    test('the "sendToExchange" method should publish message to exchange with headers.', async () => {
        const message = { test: 'data' };
        const headers = { key: 'value' };
        const channel = context.amqpClientStub.getChannel();

        await context.headersAMQPNetwork.sendToExchange({
            message,
            headers,
            exchange: 'testGroup',
        });

        expect(channel.publish).toHaveBeenCalledWith(
            'testGroup',
            '',
            Buffer.from(JSON.stringify(message)),
            { headers },
        );
    });
});
