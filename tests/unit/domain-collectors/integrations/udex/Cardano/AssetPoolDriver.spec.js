import cardanoDrivers from '../../../../../../lib/domain-collectors/integrations/udex/Cardano/index.js';
import BigNumber from 'bignumber.js';

describe('[domain-collectors/integrations/cardano]: AssetPoolDriver Tests Suite', () => {
    const context = {};

    const pair = {
        meta: {
            pool: 'addr1z8nvjzjeydcn4atcd93aac8allvrpjn7pjr2qsweukpnaytvcg6zm2vds6mz9x3h3yalqmnf24w86m09n40q3tgqxjms9yu6v8',
        },
        in: {
            meta: {
                address:
                    'c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d507357696e67526964657273',
                decimals: 0,
            },
        },
        out: {
            meta: {
                address: 'lovelace',
                decimals: 0,
            },
        },
    };

    const lpData = {
        assets: {
            amount: [
                {
                    unit: 'c0ee29a85b13209423b10447d3c2e6a50641a15c57770e27cb9d507357696e67526964657273',
                    quantity: '1',
                },
                { unit: 'lovelace', quantity: '10' },
            ],
        },

        reserveA: '1',
        reserveB: '10',
    };

    const pairQuote = '10';

    beforeEach(() => {
        context.wingRidersDriver = new cardanoDrivers.drivers['wing_riders']({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should get storage and pair price', async () => {
        jest.spyOn(context.wingRidersDriver, 'getReserves').mockResolvedValue({
            poolASize: new BigNumber(lpData.reserveA),
            poolBSize: new BigNumber(lpData.reserveB),
        });

        const result = await context.wingRidersDriver.getExchangeRate(pair);

        expect(context.wingRidersDriver.getReserves).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            exchangeRate: pairQuote,
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });
    });

    test('the "getReserves" method should return pool sizes', async () => {
        jest.spyOn(
            context.wingRidersDriver.blockFrost,
            'addresses',
        ).mockResolvedValue(lpData.assets);

        const result = await context.wingRidersDriver.getReserves(pair);

        expect(
            context.wingRidersDriver.blockFrost.addresses,
        ).toHaveBeenCalledTimes(1);
        expect({
            poolASize: result.poolASize.toString(),
            poolBSize: result.poolBSize.toString(),
        }).toEqual({
            poolASize: lpData.reserveA,
            poolBSize: lpData.reserveB,
        });
    });
});
