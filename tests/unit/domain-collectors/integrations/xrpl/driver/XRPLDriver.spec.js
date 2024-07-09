import { TimeoutError, ValidationError } from 'xrpl';
import XRPLDriver from '#domain-collectors/integrations/xrpl/driver/XRPLDriver.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

describe('[domain-collectors/integrations/xrpl]: XRPLDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.xrplClientStub = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            request: jest.fn().mockReturnValue({ result: { offers: {} } }),
            isConnected: jest.fn().mockReturnValue(false),
        };

        context.xrplDriver = new XRPLDriver('ws://test');
        context.xrplDriver.client = context.xrplClientStub;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "connect" method should call connect on client', async () => {
        await context.xrplDriver.connect();

        expect(context.xrplClientStub.connect).toHaveBeenCalledTimes(1);
    });

    test('the "disconnect" method should call disconnect on client', async () => {
        await context.xrplDriver.disconnect();

        expect(context.xrplClientStub.disconnect).toHaveBeenCalledTimes(1);
    });

    test('the "loadOrders" method should call requestBookOffers', async () => {
        jest.spyOn(context.xrplDriver, 'requestBookOffers').mockReturnValue({
            result: {},
        });

        await context.xrplDriver.loadOrders({
            in: { meta: {} },
            out: { meta: {} },
        });

        expect(context.xrplDriver.requestBookOffers).toHaveBeenCalledTimes(2);
    });

    test('the "fetchOrderBook" method should call loadOrders and format the result', async () => {
        const loadOrdersStub = jest
            .spyOn(context.xrplDriver, 'loadOrders')
            .mockReturnValue({
                asks: [
                    { quality: 1, TakerGets: { value: 1 } },
                    { quality: 2, TakerGets: { value: 2 } },
                ],
                bids: [
                    { quality: 1, TakerPays: { value: 1 } },
                    { quality: 2, TakerPays: { value: 2 } },
                ],
            });

        const result = await context.xrplDriver.fetchOrderBook({});

        expect(loadOrdersStub).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            bids: [
                [2, 2],
                [1, 1],
            ],
            asks: [
                [1, 1],
                [2, 2],
            ],
        });
    });

    test('the "fetchOrderBook" method should not call client.connect if connection exists', async () => {
        context.xrplClientStub.isConnected.mockReturnValue(true);
        const clientConnectSpy = jest.spyOn(context.xrplClientStub, 'connect');
        const loadOrdersStub = jest
            .spyOn(context.xrplDriver, 'loadOrders')
            .mockReturnValue({
                asks: [
                    { quality: 1, TakerGets: { value: 1 } },
                    { quality: 2, TakerGets: { value: 2 } },
                ],
                bids: [
                    { quality: 1, TakerPays: { value: 1 } },
                    { quality: 2, TakerPays: { value: 2 } },
                ],
            });

        const result = await context.xrplDriver.fetchOrderBook({});

        expect(loadOrdersStub).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            bids: [
                [2, 2],
                [1, 1],
            ],
            asks: [
                [1, 1],
                [2, 2],
            ],
        });
        expect(clientConnectSpy).toHaveBeenCalledTimes(0);
    });

    test('the "loadOrders" should throw RateLimitExceededException when TimeoutError is thrown', async () => {
        jest.spyOn(context.xrplDriver, 'requestBookOffers').mockImplementation(
            () => {
                throw new TimeoutError();
            },
        );

        await expect(
            context.xrplDriver.loadOrders({
                in: { meta: {} },
                out: { meta: {} },
            }),
        ).rejects.toThrow(RateLimitExceededException);
    });

    test('the "loadOrders" should throw same error when other errors are thrown', async () => {
        jest.spyOn(context.xrplDriver, 'requestBookOffers').mockImplementation(
            () => {
                throw new ValidationError();
            },
        );

        await expect(
            context.xrplDriver.loadOrders({
                in: { meta: {} },
                out: { meta: {} },
            }),
        ).rejects.toThrow(ValidationError);
    });

    test('the "requestBookOffers" method should call request on client', async () => {
        jest.spyOn(context.xrplDriver.client, 'request').mockReturnValue({});

        await context.xrplDriver.requestBookOffers();

        expect(context.xrplDriver.client.request).toHaveBeenCalled();
    });
});
