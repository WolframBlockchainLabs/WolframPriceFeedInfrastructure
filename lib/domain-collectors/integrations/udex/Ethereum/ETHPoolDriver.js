import BaseETHDriver from './BaseETHDriver.js';
import { ethers } from 'ethers';

class ETHPoolDriver extends BaseETHDriver {
    pairAbi = [
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    ];

    async getReserves(pair) {
        const pairContract = new ethers.Contract(
            pair.meta.pool,
            this.pairAbi,
            this.provider,
        );

        const reserves = await pairContract.getReserves();

        return {
            poolASize: reserves.reserve0.toString(),
            poolBSize: reserves.reserve1.toString(),
        };
    }
}

export default ETHPoolDriver;
