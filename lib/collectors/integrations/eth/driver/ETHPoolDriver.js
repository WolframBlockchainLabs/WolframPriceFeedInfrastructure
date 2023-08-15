import BigNumber from 'bignumber.js';
import BaseETHDriver from './BaseETHDriver.js';
import { ethers } from 'ethers';

class ETHPoolDriver extends BaseETHDriver {
    erc20Abi = ['function decimals() external view returns (uint8)'];

    pairAbi = [
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
        'function token0() external view returns (address)',
        'function token1() external view returns (address)',
    ];

    async getExchangeRate(pair) {
        const tokenContracts = this.getTokenContracts(pair);
        const tokensDecimals = await this.getTokensDecimals(tokenContracts);

        const pairContract = new ethers.Contract(
            pair.pool,
            this.pairAbi,
            this.provider,
        );

        const { inReserve, outReserve } = await this.getReserves({
            pair,
            pairContract,
            tokensDecimals,
        });

        const exchangeRate = new BigNumber(inReserve)
            .dividedBy(new BigNumber(outReserve))
            .toString();

        return {
            exchangeRate,
            poolASize: inReserve,
            poolBSize: outReserve,
        };
    }

    getTokenContracts(pair) {
        const inTokenContract = new ethers.Contract(
            pair.in.address,
            this.erc20Abi,
            this.provider,
        );
        const outTokenContract = new ethers.Contract(
            pair.out.address,
            this.erc20Abi,
            this.provider,
        );

        return { inTokenContract, outTokenContract };
    }

    async getTokensDecimals({ inTokenContract, outTokenContract }) {
        const inTokenDecimals = await inTokenContract.decimals();
        const outTokenDecimals = await outTokenContract.decimals();

        return { inTokenDecimals, outTokenDecimals };
    }

    async getReserves({ pair, pairContract, tokensDecimals }) {
        const reserves = await pairContract.getReserves();
        const token0 = await pairContract.token0();

        const rawReserves = [
            reserves.reserve0.toString(),
            reserves.reserve1.toString(),
        ];

        const [inRawReserve, outRawReserve] =
            token0.toLowerCase() === pair.in.address.toLowerCase()
                ? rawReserves
                : rawReserves.reverse();

        return {
            inReserve: this.toReadableAmount(
                inRawReserve,
                tokensDecimals.inTokenDecimals,
            ),
            outReserve: this.toReadableAmount(
                outRawReserve,
                tokensDecimals.outTokenDecimals,
            ),
        };
    }
}

export default ETHPoolDriver;
