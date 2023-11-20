import tezosDrivers from '../../../../../lib/domain-collectors/integrations/tezos/index.js';

describe('[domain-collectors/integrations/tezos]: PlentyDriver Tests Suite', () => {
    const context = {};

    const pair = {
        pool: 'KT1X1nkqJDR1UHwbfpcnME5Z7agJLjUQNguB',
        in: {
            address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
            decimals: 0,
            symbol: 'ctez',
            name: 'Ctez',
        },
        out: {
            address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
            decimals: 0,
            symbol: 'kUSD',
            name: 'Kolibri USD',
        },
    };

    const lpData = {
        token1_pool: '1',
        token2_pool: '10',
        token1Address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.plentyDriver = new tezosDrivers['plenty']('test');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(
            context.plentyDriver,
            'getContractStorage',
        ).mockResolvedValue();
        jest.spyOn(context.plentyDriver, 'getPairPrice').mockResolvedValue();
        jest.spyOn(context.plentyDriver, 'getTokenPools').mockResolvedValue();

        await context.plentyDriver.getExchangeRate(pair);

        expect(context.plentyDriver.getContractStorage).toHaveBeenCalledTimes(
            1,
        );
        expect(context.plentyDriver.getPairPrice).toHaveBeenCalledTimes(1);
        expect(context.plentyDriver.getTokenPools).toHaveBeenCalledTimes(1);
    });

    test('the "getPairPrice" method should return pool sizes and exchange rate', async () => {
        const result = await context.plentyDriver.getPairPrice(pair, lpData);

        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: lpData.token1_pool.toString(),
            poolBSize: lpData.token2_pool.toString(),
        });
    });

    test('the "getTokenPools" method should return pool sizes', async () => {
        const result = await context.plentyDriver.getTokenPools(lpData, pair);

        expect(result).toEqual({
            token1_pool: lpData.token1_pool.toString(),
            token2_pool: lpData.token2_pool.toString(),
        });
    });

    test('the "getTokenPools" method should return pool sizes flipped for flipped addresses', async () => {
        const flippedData = { ...lpData, token1Address: pair.out.address };
        const result = await context.plentyDriver.getTokenPools(
            flippedData,
            pair,
        );

        expect(result).toEqual({
            token2_pool: lpData.token1_pool.toString(),
            token1_pool: lpData.token2_pool.toString(),
        });
    });
});
