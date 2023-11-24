import ethDrivers from '../../../../../../lib/domain-collectors/integrations/udex/Ethereum/index.js';
import { ethers } from 'ethers';

jest.mock('ethers', () => {
    return {
        ethers: {
            Contract: jest.fn(),
            providers: {
                JsonRpcProvider: jest.fn(() => ({})),
            },
        },
    };
});

describe('[domain-collectors/integrations/eth]: UniswapV3Driver Tests Suite', () => {
    const context = {};
    const pair = {
        in: {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            decimals: 18,
            symbol: 'WETH',
            name: 'Wrapped Ether',
        },
        out: {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            decimals: 6,
            symbol: 'USDC',
            name: 'USD//C',
        },
    };

    const pairQuote = '111';

    beforeEach(() => {
        context.quoterContractStub = {
            callStatic: {
                quoteExactInputSingle: jest.fn(),
            },
        };

        ethers.Contract.mockImplementation(() => context.quoterContractStub);

        context.uniswapV3Driver = new ethDrivers.drivers['uniswap_v3']({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should format pair and get quote', async () => {
        context.quoterContractStub.callStatic.quoteExactInputSingle.mockResolvedValue(
            `${pairQuote}${'0'.repeat(pair.out.decimals)}`,
        );

        const result = await context.uniswapV3Driver.getExchangeRate(pair);

        expect(
            context.quoterContractStub.callStatic.quoteExactInputSingle,
        ).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            exchangeRate: pairQuote,
        });
    });
});
