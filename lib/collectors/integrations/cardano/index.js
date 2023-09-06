import MinswapDriver from './MinswapDriver.js';
import MuesliswapDriver from './MuesliswapDriver.js';
import WingRidersDriver from './WingRidersDriver.js';

const cardanoDrivers = {
    minswap: MinswapDriver,
    wing_riders: WingRidersDriver,
    muesliswap: MuesliswapDriver,
};

export default cardanoDrivers;
