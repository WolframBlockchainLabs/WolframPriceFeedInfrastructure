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

describe('[domain-collectors/integrations/eth]: ETHPoolDriver Tests Suite', () => {
    const context = {};

    const pair = {
        meta: {
            pool: '0xf07f378bdff2c303f52ee3e83118474e9a15d95e',
        },
        in: {
            meta: {
                address: '0x4f39687328a14dba531fcbd2305724740bb36941',
            },
            symbol: 'WETH',
            name: 'Wrapped Ether',
        },
        out: {
            meta: {
                address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            },
            symbol: 'USDC',
            name: 'USD//C',
        },
    };

    const tokenData = {
        reserves: {
            reserve0: 10,
            reserve1: 1,
        },
        preciseReserves: {
            poolASize: '10',
            poolBSize: '1',
        },
    };

    beforeEach(() => {
        context.ethPoolDriver = new ethDrivers.drivers['uniswap_v2']({
            apiSecret: 'test',
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('the "getReserves" method should return quantities of tokens in a pool', async () => {
        ethers.Contract.mockReturnValue({
            getReserves: jest.fn(() => tokenData.reserves),
        });

        const result = await context.ethPoolDriver.getReserves(pair);

        expect(result).toEqual(tokenData.preciseReserves);
    });
});
