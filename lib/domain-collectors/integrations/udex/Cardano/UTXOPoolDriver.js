import BaseCardanoDriver from './BaseCardanoDriver.js';

class UTXOPoolDriver extends BaseCardanoDriver {
    async getReserves(pair) {
        const poolUtxo = (
            await this.blockFrost.addressesUtxosAsset(
                pair.meta.pool,
                pair.meta.poolUtxo,
            )
        )[0];

        const poolASize = poolUtxo.amount.find(
            (item) => item.unit === pair.in.meta.address,
        ).quantity;
        const poolBSize = poolUtxo.amount.find(
            (item) => item.unit === pair.out.meta.address,
        ).quantity;

        return {
            poolASize,
            poolBSize,
        };
    }
}

export default UTXOPoolDriver;
