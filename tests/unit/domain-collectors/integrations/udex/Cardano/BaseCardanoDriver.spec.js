import BigNumber from 'bignumber.js';
import BaseCardanoDriver from '../../../../../../lib/domain-collectors/integrations/udex/Cardano/BaseCardanoDriver.js';

describe('[domain-collectors/integrations/cardano]: BaseCardanoDriver Tests Suite', () => {
    const context = {};

    const pair = {
        meta: {
            pool: '6aa2153e1ae896a95539c9d62f76cedcdabdcdf144e564b8955f609d660cf6a2',
        },
        in: {
            meta: {
                address: 'lovelace',
                decimals: 0,
            },
        },
        out: {
            meta: {
                address:
                    '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
                decimals: 0,
            },
        },
    };

    const lpData = {
        reserveA: '1',
        reserveB: '10',
        assetA: 'lovelace',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.minswapDriver = new BaseCardanoDriver({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(context.minswapDriver, 'getReserves').mockReturnValue({
            poolASize: new BigNumber(lpData.reserveA),
            poolBSize: new BigNumber(lpData.reserveB),
        });

        const result = await context.minswapDriver.getExchangeRate(pair);

        expect(context.minswapDriver.getReserves).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });
    });
});
