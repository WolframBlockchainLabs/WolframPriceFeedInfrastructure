import BaseTezosDriver from './BaseTezosDriver.js';
import BigNumber from 'bignumber.js';

class QuipuSwapStableswapDriver extends BaseTezosDriver {
    async getReserves(pair) {
        const storage = await this.getContractStorage(pair.meta.pool);
        const pool = await storage.storage.pools.get(0);

        const token0Info = pool.tokens_info.get('0');
        const token1Info = pool.tokens_info.get('1');

        return {
            poolASize: new BigNumber(token0Info.reserves).multipliedBy(
                new BigNumber(token0Info.precision_multiplier_f),
            ),
            poolBSize: new BigNumber(token1Info.reserves).multipliedBy(
                new BigNumber(token1Info.precision_multiplier_f),
            ),
        };
    }
}

export default QuipuSwapStableswapDriver;
