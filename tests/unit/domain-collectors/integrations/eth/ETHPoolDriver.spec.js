import ethDrivers from '../../../../../lib/domain-collectors/integrations/eth/index.js';
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

describe('[domain-collectors/integrations/eth]: ETHPoolDriver Tests Suite', () => {
    const context = {};

    const pair = {
        pool: '0xf07f378bdff2c303f52ee3e83118474e9a15d95e',
        in: {
            address: '0x4f39687328a14dba531fcbd2305724740bb36941',
            symbol: 'WETH',
            name: 'Wrapped Ether',
        },
        out: {
            address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            symbol: 'USDC',
            name: 'USD//C',
        },
    };

    const tokenData = {
        decimals: {
            inTokenDecimals: 6,
            outTokenDecimals: 6,
        },
        reserves: {
            reserve0: 10,
            reserve1: 1,
        },
        preciseReserves: {
            inReserve: '0.00001',
            outReserve: '0.000001',
        },
    };

    const pairQuote = '0.1';

    beforeEach(() => {
        context.contractStub = {
            decimals: jest.fn(() => tokenData.decimals.inTokenDecimals),
        };

        ethers.Contract.mockImplementation(() => context.contractStub);

        context.ethPoolDriver = new ethDrivers['uniswap_v2']('test');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getExchangeRate" method should format pair and get quote', async () => {
        jest.spyOn(context.ethPoolDriver, 'getReserves').mockResolvedValue(
            tokenData.preciseReserves,
        );

        const result = await context.ethPoolDriver.getExchangeRate(pair);

        expect(result).toEqual({
            poolASize: tokenData.preciseReserves.inReserve,
            poolBSize: tokenData.preciseReserves.outReserve,
            exchangeRate: pairQuote,
        });
    });

    test('the "getReserves" method should return quantities of tokens in a pool', async () => {
        const pairContract = {
            getReserves: jest.fn(() => tokenData.reserves),
            token0: jest.fn(() => pair.in.address),
        };

        const result = await context.ethPoolDriver.getReserves({
            pair,
            pairContract,
            tokensDecimals: tokenData.decimals,
        });

        expect(result).toEqual(tokenData.preciseReserves);
    });

    test('the "getReserves" method should return quantities of tokens in a pool with a correct match of tokens and pools', async () => {
        const pairContract = {
            getReserves: jest.fn(() => tokenData.reserves),
            token0: jest.fn(() => pair.out.address),
        };

        const result = await context.ethPoolDriver.getReserves({
            pair,
            pairContract,
            tokensDecimals: tokenData.decimals,
        });

        expect(result).toEqual({
            inReserve: tokenData.preciseReserves.outReserve,
            outReserve: tokenData.preciseReserves.inReserve,
        });
    });
});
