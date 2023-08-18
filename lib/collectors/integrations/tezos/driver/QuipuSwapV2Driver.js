import BaseTezosDriver from './BaseTezosDriver.js';
import BigNumber from 'bignumber.js';

class QuipuSwapV2Driver extends BaseTezosDriver {
    constructor({ rpcUrl, coreContractAddress }) {
        super(rpcUrl);

        this.coreContractAddress = coreContractAddress;
    }

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
            this.coreContractAddress,
        );
        const [response] = await dexCore.contractViews
            .get_reserves([pair.id])
            .executeView({ viewCaller: this.coreContractAddress });

        const decimals = {
            token_a_decimals: new BigNumber(10).pow(pair.in?.decimals ?? 0),
            token_b_decimals: new BigNumber(10).pow(pair.out?.decimals ?? 0),
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
