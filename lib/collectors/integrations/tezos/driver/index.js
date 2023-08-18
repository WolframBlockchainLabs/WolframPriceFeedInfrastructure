import QuipuSwapStableswapDriver from './QuipuSwapStableswapDriver.js';
import QuipuSwapV2Driver from './QuipuSwapV2Driver.js';

const tezosDrivers = {
    quipuswap_v2: QuipuSwapV2Driver,
    quipuswap_stableswap: QuipuSwapStableswapDriver,
};

export default tezosDrivers;
