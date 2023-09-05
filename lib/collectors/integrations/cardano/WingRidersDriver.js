import BaseCardanoDriver from './BaseCardanoDriver.js';
import BigNumber from 'bignumber.js';

class WingRidersDriver extends BaseCardanoDriver {
    async getExchangeRate(pair) {
        const { poolASize, poolBSize } = await this.getReserves(pair);

        const exchangeRate = poolBSize.div(poolASize);

        return {
            poolASize: poolASize.toString(),
            poolBSize: poolBSize.toString(),
            exchangeRate: exchangeRate.toString(),
        };
    }

    async getReserves(pair) {
        const utxos = await this.blockFrost.addressesUtxos(pair.pool);

        const reserves = {
            [pair.in.address]: new BigNumber(0),
            [pair.out.address]: new BigNumber(0),
        };

        utxos.forEach((utxo) => {
            utxo.amount.forEach((asset) => {
                if (!reserves[asset.unit]) return;

                reserves[asset.unit] = reserves[asset.unit].plus(
                    new BigNumber(asset.quantity),
                );
            });
        });

        return {
            poolASize: reserves[pair.in.address].div(
                new BigNumber(10).pow(pair.in.decimals),
            ),
            poolBSize: reserves[pair.out.address].div(
                new BigNumber(10).pow(pair.out.decimals),
            ),
        };
    }
}

export default WingRidersDriver;
