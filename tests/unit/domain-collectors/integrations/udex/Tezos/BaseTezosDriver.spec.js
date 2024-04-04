import BaseTezosDriver from '#domain-collectors/integrations/udex/Tezos/BaseTezosDriver.js';
import { HttpTimeoutError } from '@taquito/http-utils';

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

    test('the "verifyRateLimitError" method should return true for rate limit exceptions', async () => {
        const result = await context.baseTezosDriver.verifyRateLimitError(
            new HttpTimeoutError(),
        );

        expect(result).toBe(true);
    });

    test('the "verifyRateLimitError" method should return false for other exceptions', async () => {
        const result = await context.baseTezosDriver.verifyRateLimitError(
            new Error(),
        );

        expect(result).toBe(false);
    });
});
