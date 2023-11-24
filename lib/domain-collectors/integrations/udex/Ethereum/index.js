import ETHPoolDriver from './ETHPoolDriver.js';
import UniswapV3Driver from './UniswapV3Driver.js';

const ethDrivers = {
    groupName: 'Ethereum',
    drivers: {
        uniswap_v3: UniswapV3Driver,
        uniswap_v2: ETHPoolDriver,
        sushiswap: ETHPoolDriver,
    },
};

export default ethDrivers;
