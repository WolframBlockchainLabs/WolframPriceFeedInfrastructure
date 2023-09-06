import BaseTezosDriver from './BaseTezosDriver.js';
import BigNumber from 'bignumber.js';

class QuipuSwapV2Driver extends BaseTezosDriver {
    #CORE_CONTRACT_ADDRESS = 'KT1J8Hr3BP8bpbfmgGpRPoC9nAMSYtStZG43';

    async getExchangeRate(pair) {
        const { poolASize, poolBSize } = await this.getReserves(pair);

        const exchangeRate = poolBSize.dividedBy(poolASize);

        return {
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
            exchangeRate: exchangeRate.toString(),
        };
    }

    async getReserves(pair) {
        const dexCore = await this.tezosClient.contract.at(
            this.#CORE_CONTRACT_ADDRESS,
        );
        const [response] = await dexCore.contractViews
            .get_reserves([pair.pool])
            .executeView({ viewCaller: this.#CORE_CONTRACT_ADDRESS });

        const decimals = {
            token_a_decimals: new BigNumber(10).pow(pair.in.decimals ?? 0),
            token_b_decimals: new BigNumber(10).pow(pair.out.decimals ?? 0),
        };

        return {
            poolASize: new BigNumber(response.reserves.token_a_pool).dividedBy(
                decimals.token_a_decimals,
            ),
            poolBSize: new BigNumber(response.reserves.token_b_pool).dividedBy(
                decimals.token_b_decimals,
            ),
        };
    }
}

export default QuipuSwapV2Driver;
