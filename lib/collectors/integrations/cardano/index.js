import MinswapDriver from './MinswapDriver.js';
import UTXOPoolDriver from './UTXOPoolDriver.js';
import AssetPoolDriver from './AssetPoolDriver.js';

const cardanoDrivers = {
    minswap: MinswapDriver,
    wing_riders: AssetPoolDriver,
    vy_finance: AssetPoolDriver,
    muesliswap: UTXOPoolDriver,
    sandaeswap: UTXOPoolDriver,
};

export default cardanoDrivers;
