import BigNumber from 'bignumber.js';
import BaseUDEXDriver from '#domain-collectors/integrations/udex/BaseUDEXDriver.js';

describe('BaseUDEXDriver Tests Suite', () => {
    let driver;
    const pair = {
        in: {
            meta: {
                decimals: 2,
            },
        },
        out: {
            meta: {
                decimals: 3,
            },
        },
    };

    beforeEach(() => {
        driver = new BaseUDEXDriver({ apiSecret: 'test', meta: {} });
        driver.getReserves = jest.fn();
    });

    test('getPrecisePoolSize returns correctly formatted pool size', () => {
        const poolSize = '1000000';
        const decimals = 3;

        const result = driver.getPrecisePoolSize(poolSize, decimals);
        expect(result.toString()).toBe(
            new BigNumber(poolSize)
                .dividedBy(new BigNumber(10).pow(decimals))
                .toString(),
        );
    });

    test('getExchangeRate calculates exchange rate correctly', async () => {
        const poolASize = '1000000';
        const poolBSize = '2000000';

        driver.getReserves.mockResolvedValue({ poolASize, poolBSize });

        const result = await driver.getExchangeRate(pair);

        const precisePoolASize = new BigNumber(poolASize).dividedBy(
            new BigNumber(10).pow(pair.in.meta.decimals),
        );
        const precisePoolBSize = new BigNumber(poolBSize).dividedBy(
            new BigNumber(10).pow(pair.out.meta.decimals),
        );
        const expectedExchangeRate =
            precisePoolBSize.dividedBy(precisePoolASize);

        expect(result).toEqual({
            poolASize: precisePoolASize.toFixed(),
            poolBSize: precisePoolBSize.toFixed(),
            exchangeRate: expectedExchangeRate.toFixed(),
        });
    });
});
