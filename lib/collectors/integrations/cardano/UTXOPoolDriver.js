import BaseCardanoDriver from './BaseCardanoDriver.js';

class UTXOPoolDriver extends BaseCardanoDriver {
    async getReserves(pair) {
        const poolUtxo = (
            await this.blockFrost.addressesUtxosAsset(pair.pool, pair.poolUtxo)
        )[0];

        const poolASize = poolUtxo.amount.find(
            (item) => item.unit === pair.in.address,
        ).quantity;
        const poolBSize = poolUtxo.amount.find(
            (item) => item.unit === pair.out.address,
        ).quantity;

        return {
            poolASize,
            poolBSize,
        };
    }
}

export default UTXOPoolDriver;
