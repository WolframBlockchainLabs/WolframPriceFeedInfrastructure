import BaseEmitter from '#api/ws-api/emitters/BaseEmitter.js';
import '#api/ws-api/emitters/index.js';

describe('[emitters]: BaseEmitter Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.amqpClientStub = {};
        context.loggerStub = {
            info: jest.fn(),
            error: jest.fn(),
        };
        context.io = {};

        context.baseEmitter = new BaseEmitter({
            logger: context.loggerStub,
            amqpClient: context.amqpClientStub,
            io: context.io,
            config: {},
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('run calls logger', async () => {
        context.baseEmitter.run();

        expect(context.loggerStub.info).toHaveBeenCalledTimes(1);
    });
});
