import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { FeeAmount } from '@uniswap/v3-sdk';
import { SupportedChainId, Token } from '@uniswap/sdk-core';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json' assert { type: 'json' };

class UniswapV3Driver {
    #provider;

    #QUOTER_CONTRACT_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

    constructor(rpcUrl) {
        this.#provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }

    async getExchangeRate(pair) {
        const tokensConfig = this.#createTokensConfig(pair);
        const quoterContract = new ethers.Contract(
            this.#QUOTER_CONTRACT_ADDRESS,
            Quoter.abi,
            this.#provider,
        );

        const quotedAmountOut =
            await quoterContract.callStatic.quoteExactInputSingle(
                tokensConfig.in.address,
                tokensConfig.out.address,
                tokensConfig.poolFee,
                this.#fromReadableAmount(
                    tokensConfig.amountIn,
                    tokensConfig.in.decimals,
                ),
                0,
            );

        return this.#toReadableAmount(
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

    #fromReadableAmount(amount, decimals) {
        const result = new BigNumber(amount).times(
            new BigNumber(10).pow(decimals),
        );

        return result.toString();
    }

    #toReadableAmount(rawAmount, decimals) {
        const rawAmountBigInt = new BigNumber(rawAmount);
        const divisor = new BigNumber(10).pow(decimals);

        return rawAmountBigInt.div(divisor).toString();
    }
}

export default UniswapV3Driver;
