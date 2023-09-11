import BaseCardanoDriver from './BaseCardanoDriver.js';

class AssetPoolDriver extends BaseCardanoDriver {
    async getReserves(pair) {
        const assets = await this.blockFrost.addresses(pair.pool);

        const poolASize = assets.amount
            .find((item) => item.unit === pair.in.address)
            .quantity.toString();

        const poolBSize = assets.amount
            .find((item) => item.unit === pair.out.address)
            .quantity.toString();

        return {
            poolASize,
            poolBSize,
        };
    }
}

export default AssetPoolDriver;
