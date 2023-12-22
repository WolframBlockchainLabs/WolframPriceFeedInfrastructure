import { ethers } from 'ethers';
import { FeeAmount } from '@uniswap/v3-sdk';
import { ChainId, Token } from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json' assert { type: 'json' };
import BaseETHDriver from './BaseETHDriver.js';
import BigNumber from 'bignumber.js';

class UniswapV3Driver extends BaseETHDriver {
    #QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

    async getExchangeRate(pair) {
        const tokensConfig = this.createTokensConfig(pair);
        const quoterContract = new ethers.Contract(
            this.#QUOTER_CONTRACT_ADDRESS,
            Quoter.abi,
            this.provider,
        );

        const quotedAmountOut =
            await quoterContract.quoteExactInputSingle.staticCall(
                tokensConfig.in.address,
                tokensConfig.out.address,
                tokensConfig.poolFee,
                this.fromReadableAmount(
                    tokensConfig.amountIn,
                    tokensConfig.in.decimals,
                ),
                0,
            );

        const exchangeRate = this.toReadableAmount(
            quotedAmountOut.toString(),
            tokensConfig.out.decimals,
        );

        return { exchangeRate };
    }

    createTokensConfig(pair) {
        return {
            in: new Token(
                ChainId.MAINNET,
                pair.in.meta.address,
                pair.in.meta.decimals,
                pair.in.symbol,
                pair.in.name,
            ),
            amountIn: 1,
            out: new Token(
                ChainId.MAINNET,
                pair.out.meta.address,
                pair.out.meta.decimals,
                pair.out.symbol,
                pair.out.name,
            ),
            poolFee: FeeAmount.MEDIUM,
        };
    }

    fromReadableAmount(amount, decimals) {
        return new BigNumber(amount)
            .times(new BigNumber(10).pow(decimals))
            .toString();
    }

    toReadableAmount(rawAmount, decimals) {
        return new BigNumber(rawAmount)
            .div(new BigNumber(10).pow(decimals))
            .toString();
    }
}

export default UniswapV3Driver;
