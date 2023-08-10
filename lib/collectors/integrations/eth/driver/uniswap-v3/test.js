import UniswapV3Driver from './UniswapV3Driver.js';

const driver = new UniswapV3Driver(
    'https://mainnet.infura.io/v3/7e4727d084df43b286200e28b32d0acd',
);

console.log(
    await driver.getExchangeRate({
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
    }),
);

export default driver;
