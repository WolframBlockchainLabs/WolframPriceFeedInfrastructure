import tezosDrivers from '../../../../../../lib/domain-collectors/integrations/udex/Tezos/index.js';

describe('[domain-collectors/integrations/tezos]: PlentyDriver Tests Suite', () => {
    const context = {};

    const pair = {
        meta: {
            pool: 'KT1X1nkqJDR1UHwbfpcnME5Z7agJLjUQNguB',
        },
        in: {
            meta: {
                address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
                decimals: 0,
            },
            symbol: 'ctez',
            name: 'Ctez',
        },
        out: {
            meta: {
                address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
                decimals: 0,
            },
            symbol: 'kUSD',
            name: 'Kolibri USD',
        },
    };

    const lpData = {
        token1_pool: '1',
        token2_pool: '10',
        token1Address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
    };

    beforeEach(() => {
        context.plentyDriver = new tezosDrivers.drivers['plenty']({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(context.plentyDriver, 'getReserves').mockResolvedValue({
            poolASize: lpData.token1_pool,
            poolBSize: lpData.token2_pool,
        });

        await context.plentyDriver.getExchangeRate(pair);

        expect(context.plentyDriver.getReserves).toHaveBeenCalledTimes(1);
    });

    test('the "getReserves" method should return pool sizes and exchange rate', async () => {
        jest.spyOn(
            context.plentyDriver,
            'getContractStorage',
        ).mockResolvedValue(lpData);

        const result = await context.plentyDriver.getReserves(pair);

        expect(result).toEqual({
            poolASize: lpData.token1_pool.toString(),
            poolBSize: lpData.token2_pool.toString(),
        });
    });

    test('the "getTokenPools" method should return pool sizes flipped for flipped addresses', async () => {
        const flippedData = { ...lpData, token1Address: pair.out.meta.address };

        jest.spyOn(
            context.plentyDriver,
            'getContractStorage',
        ).mockResolvedValue(flippedData);

        const result = await context.plentyDriver.getReserves(pair);

        expect(result).toEqual({
            poolBSize: lpData.token1_pool.toString(),
            poolASize: lpData.token2_pool.toString(),
        });
    });
});
