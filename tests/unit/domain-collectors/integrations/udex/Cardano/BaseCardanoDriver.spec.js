import {
    BlockfrostClientError,
    BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import BaseCardanoDriver from '../../../../../../lib/domain-collectors/integrations/udex/Cardano/BaseCardanoDriver.js';
import RateLimitExceededException from '../../../../../../lib/domain-model/exceptions/RateLimitExceededException.js';

describe('[domain-collectors/integrations/cardano]: BaseCardanoDriver Tests Suite', () => {
    const context = {};

    beforeEach(() => {
        context.baseCardanoDriver = new BaseCardanoDriver({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getReservesWithErrorTranslation" should throw RateLimitExceededException when BlockfrostServerError is thrown with 429 code', async () => {
        jest.spyOn(context.baseCardanoDriver, 'getReserves').mockImplementation(
            () => {
                throw new BlockfrostServerError({ status_code: 429 });
            },
        );

        await expect(
            context.baseCardanoDriver.getReservesWithErrorTranslation(),
        ).rejects.toThrow(RateLimitExceededException);
    });

    test('the "getReservesWithErrorTranslation" should throw same error when other errors are thrown', async () => {
        jest.spyOn(context.baseCardanoDriver, 'getReserves').mockImplementation(
            () => {
                throw new BlockfrostClientError({});
            },
        );

        await expect(
            context.baseCardanoDriver.getReservesWithErrorTranslation(),
        ).rejects.toThrow(BlockfrostClientError);
    });
});
