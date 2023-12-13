import BigNumber from 'bignumber.js';

class BaseUDEXDriver {
    constructor({ apiSecret, meta }) {
        this.apiSecret = apiSecret;
        this.meta = meta;
    }

    async getExchangeRate(pair) {
        const { poolASize, poolBSize } = await this.getReserves(pair);

        const precisePoolASize = this.getPrecisePoolSize(
            poolASize,
            pair.in.meta?.decimals,
        );
        const precisePoolBSize = this.getPrecisePoolSize(
            poolBSize,
            pair.out.meta?.decimals,
        );

        const exchangeRate = precisePoolBSize.dividedBy(precisePoolASize);

        return {
            poolASize: precisePoolASize.toFixed(),
            poolBSize: precisePoolBSize.toFixed(),
            exchangeRate: exchangeRate.toFixed(),
        };
    }

    /* istanbul ignore next */
    async getReserves() {
        throw new Error('getReserves method is not implemented');
    }

    getPrecisePoolSize(poolSize, decimals) {
        return new BigNumber(poolSize).dividedBy(
            new BigNumber(10).pow(decimals ?? 0),
        );
    }
}

export default BaseUDEXDriver;
