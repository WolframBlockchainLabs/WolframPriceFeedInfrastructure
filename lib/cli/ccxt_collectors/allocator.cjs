const os = require('os');

function distributeExchanges(exchangesList) {
    // Sort the objects in decreasing order by array length.
    const sortedExchangesList = exchangesList.sort(
        (a, b) => b.symbols.length - a.symbols.length,
    );

    const cpuCount = os.cpus().length;

    // Create an array to represent the bins (CPUs), each with a total length and a list of objects.
    const bins = Array.from({ length: cpuCount }, () => ({
        total: 0,
        exchanges: [],
    }));

    // For each object, find the bin where it fits best and add it there.
    for (const exchange of sortedExchangesList) {
        // Find the bin that currently has the smallest total and can accommodate the object.
        let bestFitIndex = 0;
        let minTotal = Infinity;

        for (let i = 0; i < bins.length; i++) {
            if (bins[i].total < minTotal) {
                minTotal = bins[i].total;
                bestFitIndex = i;
            }
        }

        // Add the object to the best bin.
        bins[bestFitIndex].total += exchange.symbols.length;
        bins[bestFitIndex].exchanges.push(exchange);
    }

    // Return bins that contain only the objects, not the total lengths.
    return bins
        .map((bin) => bin.exchanges)
        .filter((subArr) => subArr.length !== 0);
}

module.exports = distributeExchanges;
