import BaseTezosDriver from './BaseTezosDriver.js';
import BigNumber from 'bignumber.js';

class QuipuSwapDriver extends BaseTezosDriver {
    async getExchangeRate(pair) {
        const storage = await this.getContractStorage(pair.pool);

        if (pair.in.address === '' || pair.out.address === '') {
            return this.getTezPairPrice(storage, pair);
        } else {
            return this.getPairPrice(storage, pair);
        }
    }

    async getTezPairPrice(storage, pair) {
        const pools = [
            new BigNumber(storage.storage.tez_pool),
            new BigNumber(storage.storage.token_pool),
        ];

        const [poolASize, poolBSize] =
            pair.in.address === '' ? pools : pools.reverse();

        const exchangeRate = new BigNumber(poolBSize)
            .dividedBy(new BigNumber(10 ** pair.out.decimals))
            .dividedBy(
                new BigNumber(poolASize).dividedBy(
                    new BigNumber(10 ** pair.in.decimals),
                ),
            )
            .toString();

        return {
            exchangeRate,
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
        };
    }

    async getPairPrice(storage) {
        const pool = await storage.storage.pools.get(0);

        const token0Info = pool.tokens_info.get('0');
        const token1Info = pool.tokens_info.get('1');

        const poolASize = new BigNumber(token0Info.reserves);
        const poolBSize = new BigNumber(token1Info.reserves);

        const token0Precision = new BigNumber(
            token0Info.precision_multiplier_f,
        );
        const token1Precision = new BigNumber(
            token1Info.precision_multiplier_f,
        );

        const exchangeRate = poolBSize
            .dividedBy(poolASize)
            .dividedBy(token0Precision.dividedBy(token1Precision))
            .toString();

        return {
            exchangeRate,
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
        };
    }
}

export default QuipuSwapDriver;
