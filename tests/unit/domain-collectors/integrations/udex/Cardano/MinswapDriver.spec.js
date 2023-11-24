import cardanoDrivers from '../../../../../../lib/domain-collectors/integrations/udex/Cardano/index.js';
import BigNumber from 'bignumber.js';

describe('[domain-collectors/integrations/cardano]: MinswapDriver Tests Suite', () => {
    const context = {};

    const pair = {
        pool: '6aa2153e1ae896a95539c9d62f76cedcdabdcdf144e564b8955f609d660cf6a2',
        in: {
            address: 'lovelace',
            decimals: 0,
        },
        out: {
            address:
                '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e',
            decimals: 0,
        },
    };

    const lpData = {
        reserveA: '1',
        reserveB: '10',
        assetA: 'lovelace',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.minswapDriver = new cardanoDrivers.drivers['minswap']({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(context.minswapDriver, 'getReserves').mockResolvedValue({
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

    test('the "getReserves" method should return pool sizes', async () => {
        jest.spyOn(
            context.minswapDriver.minswapAdapter,
            'getPoolById',
        ).mockResolvedValue(lpData);

        const result = await context.minswapDriver.getReserves(pair);

        expect(
            context.minswapDriver.minswapAdapter.getPoolById,
        ).toHaveBeenCalledTimes(1);
        expect({
            poolASize: result.poolASize.toString(),
            poolBSize: result.poolBSize.toString(),
        }).toEqual({
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });
    });

    test('the "getReserves" method should return pool sizes flipped for flipped addresses', async () => {
        jest.spyOn(
            context.minswapDriver.minswapAdapter,
            'getPoolById',
        ).mockResolvedValue({ ...lpData, assetA: pair.out.address });

        const result = await context.minswapDriver.getReserves(pair);

        expect(
            context.minswapDriver.minswapAdapter.getPoolById,
        ).toHaveBeenCalledTimes(1);
        expect({
            poolASize: result.poolASize.toString(),
            poolBSize: result.poolBSize.toString(),
        }).toEqual({
            poolBSize: lpData.reserveA,
            poolASize: lpData.reserveB,
        });
    });
});
