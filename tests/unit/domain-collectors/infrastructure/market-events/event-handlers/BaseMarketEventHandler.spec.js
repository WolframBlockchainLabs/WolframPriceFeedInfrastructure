import BaseMarketEventHandler from '#domain-collectors/infrastructure/market-events/event-handlers/BaseMarketEventHandler.js';

describe('[domain-collectors/infrastructure/amqp-policies/lifecycle-policy/state-manager]: BaseMarketEventHandler Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.mockMarketsAMQPManger = {
            getPolicy: jest.fn(),
        };

        context.baseMarketEventHandler = new BaseMarketEventHandler({
            marketsAMQPManger: context.mockMarketsAMQPManger,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('get EVENT_NAME should throw error when not set', () => {
        expect(() => {
            BaseMarketEventHandler.EVENT_NAME;
        }).toThrow(
            `[${BaseMarketEventHandler.name}]: Value not set for the EVENT_NAME field`,
        );
    });

    test('constructor should initialize marketsAMQPManger', () => {
        expect(context.baseMarketEventHandler.marketsAMQPManger).toBe(
            context.mockMarketsAMQPManger,
        );
    });

    test('execute method should throw not implemented error', () => {
        expect(() => {
            context.baseMarketEventHandler.execute();
        }).toThrow(
            `[${context.baseMarketEventHandler.constructor.name}]: execute method is not implemented`,
        );
    });

    test('getEventName should return EVENT_NAME', () => {
        class TestEventHandler extends BaseMarketEventHandler {
            static get EVENT_NAME() {
                return 'testEvent';
            }
        }

        const testEventHandler = new TestEventHandler({
            marketsAMQPManger: context.mockMarketsAMQPManger,
        });

        expect(testEventHandler.getEventName()).toBe('testEvent');
    });

    test('getHandler should return bound execute method', () => {
        class TestEventHandler extends BaseMarketEventHandler {
            execute() {
                return 'executed';
            }
        }

        const testEventHandler = new TestEventHandler({
            marketsAMQPManger: context.mockMarketsAMQPManger,
        });

        const handler = testEventHandler.getHandler();
        expect(handler()).toBe('executed');
    });

    test('getPolicy should return policy from marketsAMQPManger', () => {
        const mockPolicy = {};
        const Policy = jest.fn();

        context.mockMarketsAMQPManger.getPolicy.mockReturnValue(mockPolicy);

        expect(context.baseMarketEventHandler.getPolicy(Policy)).toBe(
            mockPolicy,
        );
        expect(context.mockMarketsAMQPManger.getPolicy).toHaveBeenCalledWith(
            Policy,
        );
    });
});
