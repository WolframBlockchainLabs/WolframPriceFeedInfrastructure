import { ethers } from 'ethers';
import { FeeAmount } from '@uniswap/v3-sdk';
import { SupportedChainId, Token } from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json' assert { type: 'json' };
import BaseETHDriver from './BaseETHDriver.js';

class UniswapV3Driver extends BaseETHDriver {
    #QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

    async getExchangeRate(pair) {
        const tokensConfig = this.#createTokensConfig(pair);
        const quoterContract = new ethers.Contract(
            this.#QUOTER_CONTRACT_ADDRESS,
            Quoter.abi,
            this.provider,
        );

        const quotedAmountOut =
            await quoterContract.callStatic.quoteExactInputSingle(
                tokensConfig.in.address,
                tokensConfig.out.address,
                tokensConfig.poolFee,
                this.fromReadableAmount(
                    tokensConfig.amountIn,
                    tokensConfig.in.decimals,
                ),
                0,
            );

        return this.toReadableAmount(
            quotedAmountOut.toString(),
            tokensConfig.out.decimals,
        );
    }

    #createTokensConfig(pair) {
        return {
            in: new Token(
                SupportedChainId.MAINNET,
                pair.in.address,
                pair.in.decimals,
                pair.in.symbol,
                pair.in.name,
            ),
            amountIn: 1,
            out: new Token(
                SupportedChainId.MAINNET,
                pair.out.address,
                pair.out.decimals,
                pair.out.symbol,
                pair.out.name,
            ),
            poolFee: FeeAmount.MEDIUM,
        };
    }
}

export default UniswapV3Driver;
