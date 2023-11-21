// eslint-disable-next-line import/no-unresolved
import BaseTezosDriver from '../../../../../lib/domain-collectors/integrations/tezos/BaseTezosDriver.js';

describe('[domain-collectors/integrations/tezos]: BaseTezosDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.baseTezosDriver = new BaseTezosDriver('test');

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

    test('the "getExchangeRate" method should format pair and get quote', async () => {
        const result = await context.baseTezosDriver.getContractStorage();

        expect(result).toBe('storage');
    });
});