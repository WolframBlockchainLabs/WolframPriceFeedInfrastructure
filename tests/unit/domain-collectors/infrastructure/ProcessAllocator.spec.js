const ProcessAllocator = require('#domain-collectors/infrastructure/ProcessAllocator.cjs');
const os = require('os');

jest.mock('os');

describe('ProcessAllocator Test Suite', () => {
    const context = {};

    beforeEach(() => {
        context.osCpusStub = jest
            .spyOn(os, 'cpus')
            .mockImplementation(() => new Array(4).fill({}));

        context.config = {
            potentialExchangeSize: 1,
            tolerableProcessSize: 3,
            tolerableParallelExchanges: 2,
        };

        context.processAllocator = new ProcessAllocator(context.config);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('constructor initializes properties correctly', () => {
        expect(context.processAllocator.potentialExchangeSize).toBe(
            context.config.potentialExchangeSize,
        );
        expect(context.processAllocator.tolerableProcessSize).toBe(
            context.config.tolerableProcessSize,
        );
        expect(context.processAllocator.tolerableParallelExchanges).toBe(
            context.config.tolerableParallelExchanges,
        );
        expect(context.processAllocator.exchangesPerProcess).toBe(
            Math.min(
                context.config.tolerableParallelExchanges,
                Math.floor(
                    context.config.tolerableProcessSize /
                        context.config.potentialExchangeSize,
                ),
            ),
        );
        expect(context.processAllocator.cpuCount).toBe(4);
    });

    test('allocateExchangeBins distributes exchanges across bins correctly', () => {
        const exchanges = [
            'ExchangeA',
            'ExchangeB',
            'ExchangeC',
            'ExchangeD',
            'ExchangeE',
        ];
        const allocatedBins =
            context.processAllocator.allocateExchangeBins(exchanges);

        expect(allocatedBins.length).toBeLessThanOrEqual(
            context.processAllocator.cpuCount,
        );
        expect(allocatedBins.flat()).toEqual(exchanges.sort());
    });

    test('shouldExpandBins returns true when all bins are at or above the exchange per process limit', () => {
        const bins = [
            [
                ...new Array(context.processAllocator.exchangesPerProcess).fill(
                    'Exchange',
                ),
            ],
        ];
        const shouldExpand = context.processAllocator.shouldExpandBins(bins);

        expect(shouldExpand).toBe(true);
    });

    test('getNextBestBinIndex returns the index of the bin with the least exchanges', () => {
        const bins = [['ExchangeA'], ['ExchangeB', 'ExchangeC']];

        const bestBinIndex = context.processAllocator.getNextBestBinIndex({
            bins,
            bestBinIndex: 0,
        });

        expect(bestBinIndex).toBe(0);
    });

    test('allocateExchangeBins adds a new bin when all current bins reach the exchangesPerProcess limit', () => {
        context.processAllocator.exchangesPerProcess = 1;

        const exchanges = [
            'ExchangeA',
            'ExchangeB',
            'ExchangeC',
            'ExchangeD',
            'ExchangeE',
        ];

        const allocatedBins =
            context.processAllocator.allocateExchangeBins(exchanges);

        expect(allocatedBins.length).toEqual(5);
        expect(allocatedBins.some((bin) => bin.length === 0)).toBeFalsy();
        expect(allocatedBins.flat()).toEqual(expect.arrayContaining(exchanges));
    });

    test('allocateExchangeBins returns an empty bin if exchange list is not provided', () => {
        const allocatedBins = context.processAllocator.allocateExchangeBins();

        expect(allocatedBins.length).toEqual(0);
    });
});
