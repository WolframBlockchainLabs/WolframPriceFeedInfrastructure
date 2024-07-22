import RateLimitExceededEventHandler from './RateLimitExceededEventHandler.js';
import ReloadClusterEventHandler from './ReloadClusterEventHandler.js';

const MarketEventHandlers = [
    RateLimitExceededEventHandler,
    ReloadClusterEventHandler,
];

export default MarketEventHandlers;
