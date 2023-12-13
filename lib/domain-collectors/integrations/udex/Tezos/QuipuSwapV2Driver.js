import BaseTezosDriver from './BaseTezosDriver.js';

class QuipuSwapV2Driver extends BaseTezosDriver {
    #CORE_CONTRACT_ADDRESS = 'KT1J8Hr3BP8bpbfmgGpRPoC9nAMSYtStZG43';

    async getReserves(pair) {
        const dexCore = await this.tezosClient.contract.at(
            this.#CORE_CONTRACT_ADDRESS,
        );

        const [response] = await dexCore.contractViews
            .get_reserves([pair.meta.pool])
            .executeView({ viewCaller: this.#CORE_CONTRACT_ADDRESS });

        return {
            poolASize: response.reserves.token_a_pool,
            poolBSize: response.reserves.token_b_pool,
        };
    }
}

export default QuipuSwapV2Driver;
