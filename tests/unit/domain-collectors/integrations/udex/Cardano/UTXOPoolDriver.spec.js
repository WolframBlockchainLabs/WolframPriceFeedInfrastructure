import cardanoDrivers from '../../../../../../lib/domain-collectors/integrations/udex/Cardano/index.js';

describe('Muesliswap Driver Tests', () => {
    const context = {};

    const pair = {
        pool: 'addr1z9cy2gmar6cpn8yymll93lnd7lw96f27kn2p3eq5d4tjr7xnh3gfhnqcwez2pzmr4tryugrr0uahuk49xqw7dc645chscql0d7',
        poolUtxo:
            '909133088303c49f3a30f1cc8ed553a73857a29779f6c6561cd8093fb4bc66f4c84eb38b23b4429032f7bfb825a9504845c373a70684c18ef3706b21',
        in: {
            address: 'lovelace',
            decimals: 6,
        },
        out: {
            address:
                'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344',
            decimals: 6,
        },
    };

    const lpData = {
        utxos: [
            {
                amount: [
                    {
                        unit: 'lovelace',
                        quantity: '1',
                    },
                    {
                        unit: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344',
                        quantity: '10',
                    },
                ],
            },
        ],
        reserveA: '1',
        reserveB: '10',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.muesliswapDriver = new cardanoDrivers.drivers['muesliswap']({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(context.muesliswapDriver, 'getReserves').mockReturnValue({
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });

        const result = await context.muesliswapDriver.getExchangeRate(pair);

        expect(context.muesliswapDriver.getReserves).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });
    });

    test('the "getReserves" method should return pool sizes', async () => {
        jest.spyOn(
            context.muesliswapDriver.blockFrost,
            'addressesUtxosAsset',
        ).mockReturnValue(lpData.utxos);

        const result = await context.muesliswapDriver.getReserves(pair);

        expect(
            context.muesliswapDriver.blockFrost.addressesUtxosAsset,
        ).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });
    });
});
