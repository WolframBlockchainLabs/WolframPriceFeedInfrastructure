import BaseUDEXDriver from '../../../../../../lib/domain-collectors/integrations/udex/BaseUDEXDriver.js';
import BaseTezosDriver from '../../../../../../lib/domain-collectors/integrations/udex/Tezos/BaseTezosDriver.js';
import RateLimitExceededException from '../../../../../../lib/domain-model/exceptions/RateLimitExceededException.js';

describe('[domain-collectors/integrations/tezos]: BaseTezosDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.baseTezosDriver = new BaseTezosDriver({
            apiSecret: 'test',
        });

        context.baseTezosDriver.tezosClient = {
            contract: {
                at() {
                    return {
                        storage() {
                            return 'storage';
                        },
                    };
                },
            },
        };
    });

    test('the "getContractStorage" method should return the storage', async () => {
        const result = await context.baseTezosDriver.getContractStorage();

        expect(result).toBe('storage');
    });

    test('the "getExchangeRate" should throw RateLimitExceededException taquito throws an error', async () => {
        jest.spyOn(
            BaseUDEXDriver.prototype,
            'getExchangeRate',
        ).mockImplementation(() => {
            throw new Error();
        });

        await expect(
            context.baseTezosDriver.getExchangeRate({}),
        ).rejects.toThrow(RateLimitExceededException);
    });
});
