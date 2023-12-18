import BaseUDEXDriver from '../../../../../../lib/domain-collectors/integrations/udex/BaseUDEXDriver.js';
import BaseETHDriver from '../../../../../../lib/domain-collectors/integrations/udex/Ethereum/BaseETHDriver.js';
import RateLimitExceededException from '../../../../../../lib/domain-model/exceptions/RateLimitExceededException.js';

describe('[domain-collectors/integrations/tezos]: BaseETHDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.baseETHDriver = new BaseETHDriver({
            apiSecret: 'test',
        });

        context.baseETHDriver.tezosClient = {
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

    test('the "getExchangeRate" should throw RateLimitExceededException when getReserves fails', async () => {
        jest.spyOn(BaseUDEXDriver.prototype, 'getReserves').mockImplementation(
            () => {
                throw new Error();
            },
        );

        await expect(context.baseETHDriver.getExchangeRate({})).rejects.toThrow(
            RateLimitExceededException,
        );
    });
});
