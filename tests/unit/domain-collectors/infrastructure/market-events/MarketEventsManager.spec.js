import MarketEventsManager from '#domain-collectors/infrastructure/market-events/MarketEventsManager.js';

describe('MarketEventsManager', () => {
    const context = {};

    beforeEach(() => {
        context.mockMarketsAMQPManger = {};
        context.mockMarketEventHandler = {
            init: jest.fn(),
            getEventName: jest.fn().mockReturnValue('testEvent'),
            getHandler: jest.fn().mockReturnValue(jest.fn()),
            close: jest.fn(),
        };
        context.mockMarketEventHandlerClass = jest
            .fn()
            .mockImplementation(() => context.mockMarketEventHandler);
        context.marketEventHandlers = [context.mockMarketEventHandlerClass];

        context.marketEventsManager = new MarketEventsManager({
            marketsAMQPManger: context.mockMarketsAMQPManger,
            MarketEventHandlers: context.marketEventHandlers,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with empty MarketEventHandlers', async () => {
        const marketEventsManager = new MarketEventsManager({
            marketsAMQPManger: context.marketsAMQPManger,
        });

        await marketEventsManager.init();

        expect(marketEventsManager.marketEventHandlersMap.size).toBe(0);
        expect(marketEventsManager.listenerCount()).toBe(0);
    });

    test('should initialize event handlers and set them in the map', async () => {
        await context.marketEventsManager.init();

        expect(context.mockMarketEventHandler.init).toHaveBeenCalledTimes(1);
        expect(
            context.marketEventsManager.marketEventHandlersMap.get('testEvent'),
        ).toBe(context.mockMarketEventHandler);
        expect(context.marketEventsManager.listenerCount('testEvent')).toBe(1);
    });

    test('should close event handlers and clear the map', async () => {
        await context.marketEventsManager.init();

        await context.marketEventsManager.close();

        expect(context.mockMarketEventHandler.close).toHaveBeenCalledTimes(1);
        expect(context.marketEventsManager.marketEventHandlersMap.size).toBe(0);
        expect(context.marketEventsManager.listenerCount('testEvent')).toBe(0);
    });

    test('should emit async event to the handler', async () => {
        const handler = jest.fn();
        context.marketEventsManager.on('testEvent', handler);

        await context.marketEventsManager.emitAsync(
            'testEvent',
            'arg1',
            'arg2',
        );

        expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('should not emit async event if no handler is found', async () => {
        const result =
            await context.marketEventsManager.emitAsync('nonexistentEvent');

        expect(result).toBe(false);
    });

    test('should emit async event to multiple handlers', async () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        context.marketEventsManager.on('testEvent', handler1);
        context.marketEventsManager.on('testEvent', handler2);

        await context.marketEventsManager.emitAsync(
            'testEvent',
            'arg1',
            'arg2',
        );

        expect(handler1).toHaveBeenCalledWith('arg1', 'arg2');
        expect(handler2).toHaveBeenCalledWith('arg1', 'arg2');
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
    });
});
