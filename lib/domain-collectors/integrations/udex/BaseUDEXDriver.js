import BigNumber from 'bignumber.js';
import RateLimitExceededException from '#domain-model/exceptions/RateLimitExceededException.js';

class BaseUDEXDriver {
    constructor({ apiSecret, meta }) {
        this.apiSecret = apiSecret;
        this.meta = meta;
    }

    async getExchangeRate(pair) {
        const { poolASize, poolBSize } =
            await this.getReservesWithErrorTranslation(pair);

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

    async getReservesWithErrorTranslation(pair) {
        try {
            return await this.getReserves(pair);
        } catch (error) {
            if (this.verifyRateLimitError(error)) {
                throw new RateLimitExceededException();
            }

            throw error;
        }
    }

    /* istanbul ignore next */
    async getReserves() {
        throw new Error('getReserves method is not implemented');
    }

    /* istanbul ignore next */
    verifyRateLimitError() {
        throw new Error('verifyRateLimitError method is not implemented');
    }

    getPrecisePoolSize(poolSize, decimals) {
        return new BigNumber(poolSize).dividedBy(
            new BigNumber(10).pow(decimals ?? 0),
        );
    }
}

export default BaseUDEXDriver;
