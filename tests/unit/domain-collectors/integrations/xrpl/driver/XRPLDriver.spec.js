import { TimeoutError, ValidationError } from 'xrpl';
import XRPLDriver from '../../../../../../lib/domain-collectors/integrations/xrpl/driver/XRPLDriver.js';
import RateLimitExceededException from '../../../../../../lib/domain-model/exceptions/RateLimitExceededException.js';

describe('[domain-collectors/integrations/xrpl]: XRPLDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.xrplClientStub = {
            connect: jest.fn(),
            disconnect: jest.fn(),
            request: jest.fn().mockReturnValue({ result: { offers: {} } }),
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

    test('the "loadOrders" method should call request on client', async () => {
        await context.xrplDriver.loadOrders({});

        expect(context.xrplClientStub.request).toHaveBeenCalledTimes(2);
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

    test('the "loadOrders" should throw RateLimitExceededException when TimeoutError is thrown', async () => {
        context.xrplClientStub.request.mockImplementation(() => {
            throw new TimeoutError();
        });

        await expect(context.xrplDriver.loadOrders({})).rejects.toThrow(
            RateLimitExceededException,
        );
    });

    test('the "loadOrders" should throw same error when other errors are thrown', async () => {
        context.xrplClientStub.request.mockImplementation(() => {
            throw new ValidationError();
        });

        await expect(context.xrplDriver.loadOrders({})).rejects.toThrow(
            ValidationError,
        );
    });
});
