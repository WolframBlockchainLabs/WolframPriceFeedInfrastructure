import BaseUDEXDriver from '#domain-collectors/integrations/udex/BaseUDEXDriver.js';
import BaseETHDriver from '#domain-collectors/integrations/udex/Ethereum/BaseETHDriver.js';
import RateLimitExceededException from '#domain-model/exceptions/collectors/RateLimitExceededException.js';

describe('[domain-collectors/integrations/tezos]: BaseETHDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.baseETHDriver = new BaseETHDriver({
            apiSecret: 'test',
        });
    });

    test('the "getExchangeRate" should throw RateLimitExceededException when getReserves fails', async () => {
        jest.spyOn(BaseUDEXDriver.prototype, 'getReserves').mockImplementation(
            () => {
                throw {
                    code: 'SERVER_ERROR',
                    shortMessage: 'exceeded maximum retry limit',
                };
            },
        );

        await expect(context.baseETHDriver.getExchangeRate({})).rejects.toThrow(
            RateLimitExceededException,
        );
    });
});
