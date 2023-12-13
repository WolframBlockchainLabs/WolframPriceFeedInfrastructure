import BaseTezosDriver from './BaseTezosDriver.js';

class PlentyDriver extends BaseTezosDriver {
    async getReserves(pair) {
        const storage = await this.getContractStorage(pair.meta.pool);

        const storagePools = [storage.token1_pool, storage.token2_pool];
        const [token1_pool, token2_pool] =
            pair.in.meta.address === storage.token1Address
                ? storagePools
                : storagePools.reverse();

        return {
            poolASize: token1_pool,
            poolBSize: token2_pool,
        };
    }
}

export default PlentyDriver;
