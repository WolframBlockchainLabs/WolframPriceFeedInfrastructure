const os = require('os');

class ProcessAllocator {
    constructor({
        potentialExchangeSize,
        tolerableProcessSize,
        tolerableParallelExchanges,
    }) {
        this.potentialExchangeSize = potentialExchangeSize;
        this.tolerableProcessSize = tolerableProcessSize;
        this.tolerableParallelExchanges = tolerableParallelExchanges;

        this.exchangesPerProcess = Math.min(
            tolerableParallelExchanges,
            Math.floor(tolerableProcessSize / potentialExchangeSize),
        );
        this.cpuCount = os.cpus().length;
    }

    allocateExchangeBins(exchanges = []) {
        const bins = Array.from({ length: this.cpuCount }, () => []);
        let bestBinIndex = 0;

        exchanges.forEach((exchange) => {
            bestBinIndex = this.getNextBestBinIndex({
                bins,
                bestBinIndex,
            });

            bins[bestBinIndex].push(exchange);

            if (this.shouldExpandBins(bins)) {
                bins.push([]);
            }
        });

        return bins.filter((bin) => bin.length !== 0);
    }

    shouldExpandBins(bins) {
        return bins.every((bin) => bin.length >= this.exchangesPerProcess);
    }

    getNextBestBinIndex({ bins, bestBinIndex }) {
        for (let i = 0; i < bins.length; i++) {
            if (bins[i].length < bins[bestBinIndex].length) {
                return i;
            }
        }

        return bestBinIndex;
    }
}

module.exports = ProcessAllocator;
