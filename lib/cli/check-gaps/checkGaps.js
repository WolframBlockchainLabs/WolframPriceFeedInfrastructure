import datatypeFetchers from './datatype-fetchers/index.js';

async function checkGaps({ startDate, endDate, datatype, marketId }) {
    const data = await datatypeFetchers[datatype]({
        startDate,
        endDate,
        marketId,
    });

    const results = {
        markets: {},
        total: 0,
    };

    for (let i = 0; i <= data.length - 1; i++) {
        const currentMarketId = data[i].marketId;
        results.markets[currentMarketId] ??= 0;

        if (data[i].marketId !== data[i + 1]?.marketId) {
            results.total += results.markets[currentMarketId];
        } else if (
            data[i].intervalEnd.toString() !==
            data[i + 1].intervalStart.toString()
        ) {
            results.markets[currentMarketId]++;
        }
    }

    return results;
}

export default checkGaps;
